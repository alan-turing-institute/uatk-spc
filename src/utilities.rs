//! Useful for working with files, downloading, creating progress bars, etc. Ultimately most of
//! these will become a proper crate for idempotently working with external datasets.

use std::cmp::min;
use std::io::{BufWriter, Write};
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::Result;
use flate2::read::GzDecoder;
use fs_err::File;
use futures_util::StreamExt;
use indicatif::{HumanBytes, ProgressBar, ProgressStyle};
use reqwest::Client;
use serde::de::DeserializeOwned;
use serde::Serialize;
use tar::Archive;

/// Downloads a file and writes it to the output path. Skips if the output already exists. Returns the output path.
pub async fn download<P1: AsRef<Path>, P2: Into<PathBuf>>(url: P1, output: P2) -> Result<PathBuf> {
    let url = url.as_ref();
    let output = output.into();
    info!("Downloading {} to {}", url.display(), output.display());

    if output.exists() {
        info!("... file exists, skipping");
        return Ok(output);
    }

    if let Some(parent) = output.parent() {
        fs_err::create_dir_all(parent)?;
    }

    download_file(&url.display().to_string(), &output.display().to_string()).await?;
    Ok(output)
}

/// Extract a tar.gz file somewhere. If the expected_output exists, skip. This could be a single
/// file or a directory.
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

/// Unzip a file into an output_dir.
pub fn unzip(file: PathBuf, output_dir: &str) -> Result<()> {
    info!("Unzipping {} to {}...", file.display(), output_dir);
    fs_err::create_dir_all(output_dir)?;
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

/// Gunzip a file in-place. Returns the path without the .gz extension
pub fn gunzip(file: PathBuf) -> Result<String> {
    let target = file
        .display()
        .to_string()
        .trim_end_matches(".gz")
        .to_string();
    if Path::new(&target).exists() {
        info!("{target} already exists, not gunzipping");
        return Ok(target);
    }

    info!("Gunzipping {}...", file.display());
    let status = Command::new("gunzip").arg(file).status()?;
    if status.success() {
        Ok(target)
    } else {
        bail!("Command failed");
    }

    // TODO Ideally delete the .gz file, and make the download+gunzip step smart about seeing the
    // final target
}

/// Extract the filename from a path -- for example, "foo.txt.gz" from "/home/someone/foo.txt.gz"
pub fn filename<P: AsRef<Path>>(path: P) -> String {
    path.as_ref()
        .file_name()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}

/// Extract the basename from a path -- for example, "foo" from "/home/someone/foo.txt".
///
/// TODO Note it doesn't strip file extensions repeatedly -- basename(foo.shp.zip) is foo.shp.
pub fn basename<P: AsRef<Path>>(path: P) -> String {
    path.as_ref()
        .file_stem()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}

/// Prints a count with commas -- ie, 12345 becomes "12,345"
pub fn print_count(x: usize) -> String {
    // TODO Ask about adjusting their API to take usizes...
    indicatif::HumanCount(x as u64).to_string()
}

// Adapted from
// https://github.com/mihaigalos/tutorials/blob/master/rust/download_with_progressbar/src/main.rs
async fn download_file(url: &str, path: &str) -> Result<()> {
    let client = Client::new();
    let response = client.get(url).send().await?;
    let response = response.error_for_status()?;
    let total_size = response
        .content_length()
        .ok_or_else(|| anyhow!("Failed to get content length from {}", url))?;

    let pb = ProgressBar::new(total_size);
    pb.set_style(ProgressStyle::default_bar()
        .template("[{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({bytes_per_sec}, {eta})")
        .unwrap()
        .progress_chars("#-"));

    let mut file = File::create(path)?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item?;
        file.write_all(&chunk)?;
        let new = min(downloaded + (chunk.len() as u64), total_size);
        downloaded = new;
        pb.set_position(new);
    }

    Ok(())
}

/// Serializes an object using the bincode format
pub fn write_binary<T: Serialize, P: AsRef<Path>>(object: &T, path: P) -> Result<()> {
    let path = path.as_ref();
    if let Some(parent) = path.parent() {
        fs_err::create_dir_all(parent)?;
    }
    let file = BufWriter::new(File::create(path)?);
    bincode::serialize_into(file, object)?;
    Ok(())
}

/// Deserializes an object from the bincode format
pub fn read_binary<T: DeserializeOwned>(path: String) -> Result<T> {
    // TODO Progress bar with wrap_read looks nice, but dramatically slows down reading
    let object = bincode::deserialize_from(File::open(path)?)?;
    Ok(object)
}

// TODO Can we further improve the API? Ideally just a '.wrap_progress_count()' on iterators, with
// automatic inc(1). If we want to set messages every 1000 iterations, any way to include a
// callback?

/// Creates a nicely-styled progress bar for iterating over some number of items. No messages are
/// supported.
pub fn progress_count(len: usize) -> ProgressBar {
    let pb = ProgressBar::new(len as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template("[{elapsed_precise}] [{wide_bar:.cyan/blue}] {human_pos}/{human_len} ({eta})")
            .unwrap()
            .progress_chars("#-"),
    );
    pb
}

/// Creates a nicely-styled progress bar for iterating over some number of items. Messages are
/// supported.
pub fn progress_count_with_msg(len: usize) -> ProgressBar {
    let pb = ProgressBar::new(len as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template("{msg}\n[{elapsed_precise}] [{wide_bar:.cyan/blue}] {human_pos}/{human_len} ({eta})")
            .unwrap()
            .progress_chars("#-"),
    );
    pb
}

/// Creates a nicely-styled progress bar for reading a file. Messages are supported.
pub fn progress_file_with_msg(file: &File) -> Result<ProgressBar> {
    let pb = ProgressBar::new(file.metadata()?.len());
    pb.set_style(
        ProgressStyle::default_bar()
            .template(
                "{msg}\n[{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({eta})",
            )
            .unwrap()
            .progress_chars("#-"),
    );
    Ok(pb)
}

/// Describes the current memory usage of this program.
///
/// TODO The results are questionable, though
pub fn memory_usage() -> String {
    format!(
        "Memory usage: {}",
        indicatif::HumanBytes(crate::ALLOCATOR.allocated() as u64)
    )
}
