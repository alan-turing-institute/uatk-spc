use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::Result;

// TODO I'm not happy at all about any of this, just temporary.

/// Returns the filename
pub fn download(url: PathBuf) -> Result<PathBuf> {
    let filename = filename(&url);
    let output = Path::new("raw_data").join(filename);

    info!("Downloading {} to {}", url.display(), output.display());

    if output.exists() {
        info!("... file exists, skipping");
        return Ok(output);
    }

    std::fs::create_dir_all("raw_data")?;
    let status = Command::new("wget")
        .arg(url)
        .arg("-O")
        .arg(&output)
        .status()?;
    if status.success() {
        Ok(output)
    } else {
        bail!("Command failed");
    }
}

pub fn untar(file: PathBuf) -> Result<()> {
    info!("Untarring {}...", file.display());
    // TODO Skipping isn't really idempotent; we still spend time gunzipping. Maybe we have to
    // insist on extracting one known path.
    let status = Command::new("tar")
        .arg("xzvf")
        .arg(file)
        .arg("--directory")
        .arg("raw_data")
        .arg("--skip-old-files")
        .status()?;
    if status.success() {
        Ok(())
    } else {
        bail!("Command failed");
    }
}

pub fn unzip(file: PathBuf, output_dir: String) -> Result<()> {
    info!("Unzipping {} to {}...", file.display(), output_dir);
    std::fs::create_dir_all(&output_dir)?;
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

pub fn filename(path: &PathBuf) -> String {
    path.file_name()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}

pub fn basename(path: &PathBuf) -> String {
    // TODO .shp.zip results in .shp
    path.file_stem()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}
