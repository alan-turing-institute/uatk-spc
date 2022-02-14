//! QUANT is http://quant.casa.ucl.ac.uk. RAMP uses it to get a probability distribution of how
//! likely people are to travel from their home MSOA to different venues for various activities.

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::path::Path;
use std::process::Command;

use anyhow::Result;
use fs_err::File;
use geo::Point;
use ndarray::Array2;
use ndarray_npy::ReadNpyExt;
use ordered_float::NotNan;
use proj::Proj;
use serde::Deserialize;
use typed_index_collections::TiVec;

use crate::utilities::progress_count_with_msg;
use crate::{Activity, Venue, VenueID, MSOA};

pub enum Threshold {
    /// Take the top values until we hit a sum
    #[allow(unused)]
    Sum(f64),
    /// Take the top values.
    // TODO In the Python code, what did NR stand for?
    TopN(usize),
}

/// For a given activity, find the probability of somebody living in different MSOAs going to
/// different venues for that activity.
pub fn get_flows(
    activity: Activity,
    msoas: BTreeSet<MSOA>,
    threshold: Threshold,
) -> Result<BTreeMap<MSOA, Vec<(VenueID, f64)>>> {
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
        Path::new("raw_data/nationaldata/QUANT_RAMP").join(population_csv),
    )?)
    .deserialize()
    {
        let rec: PopulationRow = rec?;
        msoa_to_zonei.insert(rec.msoaiz, rec.zonei);
    }

    let table_path =
        format!("raw_data/nationaldata/QUANT_RAMP/{}", prob_sij).replace(".bin", ".npy");

    if File::open(&table_path).is_err() {
        info!(
            "Running a Python script to convert QUANT data from pickle to the regular numpy format"
        );
        let status = Command::new("python3")
            .arg("scripts/fix_quant_data.py")
            .status()?;
        if !status.success() {
            bail!("fix_quant_data.py failed");
        }
    }
    let table = match File::open(table_path) {
        Ok(file) => Array2::<f64>::read_npy(file)?,
        Err(err) => {
            bail!(
                "Even after fix_quant_data.py, a QUANT file is missing: {}",
                err
            );
        }
    };

    let pb = progress_count_with_msg(msoas.len());
    let mut result = BTreeMap::new();
    for msoa in msoas {
        // TODO The Python code defaults to 0 when the MSOA is missing; this seems problematic?
        let zonei = msoa_to_zonei.get(&msoa).cloned().unwrap_or(0);
        pb.set_message(format!(
            "Get {:?} flows for {} (zonei {})",
            activity, msoa.0, zonei
        ));
        pb.inc(1);

        let pr_visit_venue = match activity {
            // TODO These're treated exactly the same?
            Activity::Retail | Activity::Nightclub => get_venue_flows(zonei, &table, 0.0)?,
            Activity::PrimarySchool => get_venue_flows(zonei, &table, 0.0)?,
            Activity::SecondarySchool => get_venue_flows(zonei, &table, 0.0)?,
            // Something else must handle these
            Activity::Home | Activity::Work => unreachable!(),
        };

        // There are lots of venues! Just keep some of them
        result.insert(msoa, normalize(threshold.apply(pr_visit_venue)));
    }
    Ok(result)
}

impl Threshold {
    fn apply(&self, mut flows: Vec<(VenueID, f64)>) -> Vec<(VenueID, f64)> {
        // First sort ascending by probability
        // TODO We're going to want a probability type
        flows.sort_by_key(|pair| NotNan::new(pair.1).unwrap());

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

// From this MSOA, find the probability of visiting each venue. Returns a normalized distribution.
fn get_venue_flows(
    zonei: usize,
    table: &Array2<f64>,
    min_threshold: f64,
) -> Result<Vec<(VenueID, f64)>> {
    let mut results = Vec::new();
    for venue in 0..table.shape()[1] {
        let p = table[[zonei, venue]];
        if p >= min_threshold {
            results.push((VenueID(venue), p));
        }
        // TODO If not, we won't match up with venues?
    }
    Ok(results)
}

pub fn load_venues(activity: Activity) -> Result<TiVec<VenueID, Venue>> {
    // I had the wrong CRS originally, but it's from "British National Grid"
    let reproject = Proj::new_known_crs("EPSG:27700", "EPSG:4326", None)
        .ok_or(anyhow!("Couldn't set up CRS projection"))?;

    let csv_path = match activity {
        Activity::Retail | Activity::Nightclub => "retailpointsZones.csv",
        Activity::PrimarySchool => "primaryZones.csv",
        Activity::SecondarySchool => "secondaryZones.csv",
        Activity::Home | Activity::Work => unreachable!(),
    };
    let mut venues = TiVec::new();
    for rec in csv::Reader::from_reader(File::open(format!(
        "raw_data/nationaldata/QUANT_RAMP/{}",
        csv_path
    ))?)
    .deserialize()
    {
        let rec: ZoneRow = rec?;
        // Let's check this while we're at it
        assert_eq!(venues.len(), rec.zonei);

        let pt = reproject.convert((rec.east, rec.north))?;

        venues.push(Venue {
            id: VenueID(venues.len()),
            activity,
            // TODO Weird geo_types version problem, possibly because of the f32/f64 problem
            location: Point::new(pt.lng() as f32, pt.lat() as f32),
            urn: rec.urn,
        });
    }
    Ok(venues)
}

#[derive(Deserialize)]
struct PopulationRow {
    msoaiz: MSOA,
    zonei: usize,
}

#[derive(Debug, Deserialize)]
struct ZoneRow {
    east: f64,
    north: f64,
    zonei: usize,
    urn: Option<usize>,
}

// Make things sum to 1
fn normalize(mut flows: Vec<(VenueID, f64)>) -> Vec<(VenueID, f64)> {
    let sum: f64 = flows.iter().map(|pair| pair.1).sum();
    for (_, pr) in &mut flows {
        *pr /= sum;
    }
    flows
}
