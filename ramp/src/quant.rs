use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::path::Path;

use anyhow::Result;
use ordered_float::NotNan;
use serde::Deserialize;

use crate::population::VenueID;
use crate::MSOA;

pub enum Threshold {
    // Take the top values until we hit a sum
    Sum(f64),
    // TODO What did NR stand for?
    TopN(usize),
}

pub fn quant_get_flows(
    venue: &str,
    msoas: HashSet<MSOA>,
    threshold: Threshold,
) -> Result<HashMap<MSOA, Vec<(VenueID, f64)>>> {
    let mut result = HashMap::new();
    // TODO This is slow, ripe for parallelization
    for msoa in msoas {
        info!("Get flows for {}", msoa.0);
        let mut pr_visit_venue = match venue {
            "Retail" => get_retail_pr(
                msoa.clone(),
                "retailpointsPopulation.csv",
                "retailpointsZones.csv",
                "retailpointsProbSij.bin",
                0.0,
            )?,
            _ => bail!("Unknown venue {}", venue),
        };

        // Sort ascending by probability
        // TODO We're going to want a probability type
        pr_visit_venue.sort_by_key(|pair| NotNan::new(pair.1).unwrap());

        // Filter the venues
        result.insert(msoa, threshold.apply(pr_visit_venue));
    }
    Ok(result)
}

impl Threshold {
    // flows must be sorted ascending by probability
    fn apply(&self, mut flows: Vec<(VenueID, f64)>) -> Vec<(VenueID, f64)> {
        match self {
            Threshold::Sum(sum_needed) => {
                let mut sum = 0.0;
                let mut result = Vec::new();
                for (venue, p) in flows.into_iter().rev() {
                    if sum >= *sum_needed {
                        break;
                    }
                    result.push((venue, p));
                    sum += p;
                }
                result
            }
            Threshold::TopN(n) => {
                // TODO The indices in the original code are super scary, it keeps around a bunch
                // of 0's instead of just keeping the venue IDs or whatever
                let top_n = flows.split_off(flows.len() - n);
                assert_eq!(top_n.len(), *n);
                top_n
            }
        }
    }
}

// getProbableRetailByMSOAIZ
// From this MSOA, find the probability of visiting each venue
fn get_retail_pr(
    msoa: MSOA,
    population_csv: &str,
    // TODO This is only passed in for the commented out work in the inner loop
    _zones_csv: &str,
    prob_sij: &str,
    min_threshold: f64,
) -> Result<Vec<(VenueID, f64)>> {
    use ndarray::Array2;
    use ndarray_npy::ReadNpyExt;

    // TODO Defaulting to 0 when the MSOA is missing seems weird?!
    // TODO Could definitely cache this and the table
    let start = std::time::Instant::now();
    let zonei = lookup_zonei_from_population_csv(msoa.clone(), population_csv)?.unwrap_or(0);

    // TODO Unpickling is going to be hard. In python...
    //
    // import pickle
    // import numpy
    // x = pickle.load(open("national_data/QUANT_RAMP/retailpointsProbSij.bin", "rb"))
    // numpy.save('national_data/QUANT_RAMP/retailpointsProbSij.npy', x)
    let path = format!("raw_data/QUANT_RAMP/{}", prob_sij).replace(".bin", ".npy");
    let table = Array2::<f64>::read_npy(File::open(path)?)?;
    info!("Shareable work took {:?}", start.elapsed());

    let mut results = Vec::new();
    // raw_data/QUANT_RAMP/retailpointsZones.csv has 14,228 rows representing venues.
    // n is 14,228 so hey that's good! one per venue.
    for venue in 0..table.shape()[1] {
        // TODO Check if this is row- or column-major in memory. Are we playing with the cache
        // nicely?
        let p = table[[zonei, venue]];
        if p >= min_threshold {
            results.push((VenueID(venue), p));
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
