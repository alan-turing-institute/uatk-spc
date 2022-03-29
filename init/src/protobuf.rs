use std::fs::File;
use std::io::{BufWriter, Write};

use anyhow::Result;
use prost::Message;

use crate::{pb, Population};

pub fn convert_to_pb(input: &Population, output_path: String) -> Result<()> {
    let mut output = pb::Population::default();

    for household in &input.households {
        output.households.push(pb::Household {
            msoa: household.msoa.0.clone(),
            orig_hid: household.orig_hid.try_into()?,
            members: household
                .members
                .iter()
                .map(|id| id.0.try_into().unwrap())
                .collect(),
        });
    }

    let mut buf = Vec::new();
    buf.reserve(output.encoded_len());
    output.encode(&mut buf)?;
    let mut f = BufWriter::new(File::create(output_path)?);
    f.write_all(&buf)?;
    Ok(())
}
