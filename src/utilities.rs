use std::cmp::min;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::Result;
use ex::fs::File;
use flate2::read::GzDecoder;
use futures_util::StreamExt;
use indicatif::{HumanBytes, ProgressBar, ProgressStyle};
use reqwest::Client;
use tar::Archive;

// TODO I'm not happy at all about any of this, just temporary.

/// Returns the output path
pub async fn download<P1: AsRef<Path>, P2: Into<PathBuf>>(url: P1, output: P2) -> Result<PathBuf> {
    let url = url.as_ref();
    let output = output.into();
    info!("Downloading {} to {}", url.display(), output.display());

    if output.exists() {
        info!("... file exists, skipping");
        return Ok(output);
    }

    if let Some(parent) = output.parent() {
        ex::fs::create_dir_all(parent)?;
    }

    download_file(&url.display().to_string(), &output.display().to_string()).await?;
    Ok(output)
}

pub fn untar(file: PathBuf, expected_output: &str) -> Result<()> {
    if Path::new(expected_output).exists() {
        info!(
            "{} already exists, not untarring {}",
            expected_output,
            file.display()
        );
        return Ok(());
    }

    info!("Untarring {}...", file.display());

    let tar_gz = File::open(file)?;
    // TODO Detect if we need to gunzip, or make caller tell us too?
    let tar = GzDecoder::new(tar_gz);
    let mut archive = Archive::new(tar);

    // TODO Progress hint...
    for entry in archive.entries()? {
        let mut entry = entry?;
        info!(
            "Extracting {}, which is {}",
            entry.path()?.display(),
            HumanBytes(entry.size())
        );
        // TODO This implements Read, we could have a granular progress bar
        // TODO Make sure this path is correct
        entry.unpack_in(Path::new(expected_output).parent().unwrap())?;
    }

    Ok(())
}

pub fn unzip(file: PathBuf, output_dir: String) -> Result<()> {
    info!("Unzipping {} to {}...", file.display(), output_dir);
    ex::fs::create_dir_all(&output_dir)?;
    let status = Command::new("unzip")
        .arg("-n") // Skip if it exists
        .arg(file)
        .arg("-d")
        .arg(output_dir)
        .status()?;
    if status.success() {
        Ok(())
    } else {
        bail!("Command failed");
    }
}

pub fn filename<P: AsRef<Path>>(path: P) -> String {
    path.as_ref()
        .file_name()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}

pub fn basename<P: AsRef<Path>>(path: P) -> String {
    // TODO .shp.zip results in .shp
    path.as_ref()
        .file_stem()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}

pub fn print_count(x: usize) -> String {
    let num = format!("{}", x);
    let mut result = String::new();
    let mut i = num.len();
    for c in num.chars() {
        result.push(c);
        i -= 1;
        if i > 0 && i % 3 == 0 {
            result.push(',');
        }
    }
    result
}

// Adapted from
// https://github.com/mihaigalos/tutorials/blob/master/rust/download_with_progressbar/src/main.rs
async fn download_file(url: &str, path: &str) -> Result<()> {
    let client = Client::new();
    let res = client.get(url).send().await?;
    let total_size = res
        .content_length()
        .ok_or(anyhow!("Failed to get content length from {}", url))?;

    let pb = ProgressBar::new(total_size);
    pb.set_style(ProgressStyle::default_bar()
        .template("{msg}\n[{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({bytes_per_sec}, {eta})")
        .progress_chars("#-"));
    pb.set_message(format!("Downloading {}", url));

    let mut file = File::create(path)?;
    let mut downloaded: u64 = 0;
    let mut stream = res.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item?;
        file.write(&chunk)?;
        let new = min(downloaded + (chunk.len() as u64), total_size);
        downloaded = new;
        pb.set_position(new);
    }

    // TODO It'd almost be nice to print a summary of the time and size, and use the logging format
    pb.finish_with_message(format!("Downloaded {} to {}", url, path));
    Ok(())
}
