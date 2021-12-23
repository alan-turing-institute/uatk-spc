use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::path::Path;

use anyhow::Result;
use ndarray::Array2;
use ndarray_npy::ReadNpyExt;
use ordered_float::NotNan;
use serde::Deserialize;

use crate::population::{Activity, VenueID};
use crate::MSOA;

pub enum Threshold {
    // Take the top values until we hit a sum
    Sum(f64),
    // TODO What did NR stand for?
    TopN(usize),
}

pub fn quant_get_flows(
    activity: Activity,
    msoas: HashSet<MSOA>,
    threshold: Threshold,
) -> Result<HashMap<MSOA, Vec<(VenueID, f64)>>> {
    // Build a mapping from MSOA to zonei
    let mut msoa_to_zonei: HashMap<MSOA, usize> = HashMap::new();
    let (population_csv, prob_sij) = match activity {
        Activity::Retail | Activity::Nightclub => {
            ("retailpointsPopulation.csv", "retailpointsProbSij.bin")
        }
        // TODO PiJ? SiJ? HiJ?
        Activity::PrimarySchool => ("primaryPopulation.csv", "primaryProbPij.bin"),
        Activity::SecondarySchool => ("secondaryPopulation.csv", "secondaryProbPij.bin"),
        Activity::Home | Activity::Work => unreachable!(),
    };
    for rec in csv::Reader::from_reader(File::open(
        Path::new("raw_data/QUANT_RAMP").join(population_csv),
    )?)
    .deserialize()
    {
        let rec: RetailPopRow = rec?;
        msoa_to_zonei.insert(rec.msoaiz, rec.zonei);
    }

    // TODO Unpickling is going to be hard. In python...
    //
    // import pickle
    // import numpy
    // x = pickle.load(open("national_data/QUANT_RAMP/retailpointsProbSij.bin", "rb"))
    // numpy.save('national_data/QUANT_RAMP/retailpointsProbSij.npy', x)
    let table_path = format!("raw_data/QUANT_RAMP/{}", prob_sij).replace(".bin", ".npy");
    let table = Array2::<f64>::read_npy(File::open(table_path)?)?;

    let mut result = HashMap::new();
    // TODO This is no longer slow, but we could still parallelize
    for msoa in msoas {
        // TODO Defaulting to 0 when the MSOA is missing seems weird?!
        let zonei = msoa_to_zonei.get(&msoa).cloned().unwrap_or(0);

        info!("Get {:?} flows for {} (zonei {})", activity, msoa.0, zonei);
        let mut pr_visit_venue = match activity {
            // TODO These're treated exactly the same?!
            Activity::Retail | Activity::Nightclub => {
                get_venue_flows(msoa.clone(), zonei, &table, "retailpointsZones.csv", 0.0)?
            }
            Activity::PrimarySchool => {
                get_venue_flows(msoa.clone(), zonei, &table, "primaryZones.csv", 0.0)?
            }
            Activity::SecondarySchool => {
                get_venue_flows(msoa.clone(), zonei, &table, "secondaryZones.csv", 0.0)?
            }
            // Something else must handle these
            Activity::Home | Activity::Work => unreachable!(),
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

// From this MSOA, find the probability of visiting each venue
fn get_venue_flows(
    msoa: MSOA,
    zonei: usize,
    table: &Array2<f64>,
    // TODO This is only passed in for the commented out work in the inner loop
    _zones_csv: &str,
    min_threshold: f64,
) -> Result<Vec<(VenueID, f64)>> {
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

#[derive(Deserialize)]
struct RetailPopRow {
    msoaiz: MSOA,
    zonei: usize,
}
