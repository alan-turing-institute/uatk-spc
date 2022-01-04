use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::StudyAreaCache;

/// This is the input into the OpenCL simulation. See
/// https://github.com/Urban-Analytics/RAMP-UA/blob/master/microsim/opencl/doc/model_design.md
#[derive(Serialize, Deserialize)]
// TODO We probably want to write as an npz, not serde
pub struct Snapshot {
    people_ages: Vec<u16>,
}

impl Snapshot {
    pub fn generate(_input: StudyAreaCache) -> Result<Snapshot> {
        bail!("TODO")
    }
}
