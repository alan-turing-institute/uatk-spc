use std::collections::HashSet;
use std::fs::File;
use std::path::Path;

use anyhow::Result;
use serde::Deserialize;

use crate::MSOA;

pub fn quant_get_flows(venue: &str, msoas: HashSet<MSOA>) -> Result<()> {
    for msoa in msoas {
        let result_tmp = match venue {
            "Retail" => get_retail_pr(
                msoa,
                "retailpointsPopulation.csv",
                "retailpointsZones.csv",
                "retailpointsProbSij.bin",
                0.0,
            )?,
            _ => bail!("Unknown venue {}", venue),
        };
    }

    Ok(())
}

// getProbableRetailByMSOAIZ
// List of probabilities in the order matching venues
fn get_retail_pr(
    msoa: MSOA,
    population_csv: &str,
    zones_csv: &str,
    prob_sij: &str,
    min_threshold: f64,
) -> Result<Vec<f64>> {
    use ndarray::Array2;
    use ndarray_npy::ReadNpyExt;

    let zonei = lookup_zonei_from_population_csv(msoa.clone(), population_csv)?.unwrap_or(0);

    // TODO Unpickling is going to be hard. In python...
    // import pickle
    // import numpy
    // x = pickle.load(open("national_data/QUANT_RAMP/retailpointsProbSij.bin", "rb"))
    // numpy.save('national_data/QUANT_RAMP/retailpointsProbSij.npy', x)
    let table =
        Array2::<f64>::read_npy(File::open("raw_data/QUANT_RAMP/retailpointsProbSij.npy")?)?;

    // m and n are probably row and column size of the table
    let mut results = Vec::new();
    let n = table.shape()[1];
    for j in 0..n {
        let p = table[[zonei, j]];
        if p >= min_threshold {
            results.push(p);
            // TODO Why the extra work here?
        }
        // TODO If not, we won't match up with venues?
    }

    //info!("MSOA {} mapped to zonei {}. m is {}, n is {}, we got {} results", msoa.0, zonei, m, n, results.len());

    Ok(results)
}

// From population_csv, find the ONE row where msoaiz matches, and return zonei of that
fn lookup_zonei_from_population_csv(msoa: MSOA, population_csv: &str) -> Result<Option<usize>> {
    for rec in csv::Reader::from_reader(File::open(
        Path::new("raw_data/QUANT_RAMP").join(population_csv),
    )?)
    .deserialize()
    {
        let rec: RetailPopRow = rec?;
        if rec.msoaiz == msoa {
            return Ok(Some(rec.zonei));
        }
    }
    Ok(None)
}

#[derive(Deserialize)]
struct RetailPopRow {
    msoaiz: MSOA,
    zonei: usize,
}
