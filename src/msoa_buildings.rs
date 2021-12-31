use std::collections::{BTreeMap, BTreeSet};
use std::io::BufReader;

use anyhow::Result;
use geo::algorithm::centroid::Centroid;
use geo::algorithm::contains::Contains;
use geo::map_coords::MapCoordsInplace;
use geo::{MultiPolygon, Point};
use indicatif::{ProgressBar, ProgressStyle};
use proj::Proj;

use crate::utilities::print_count;
use crate::MSOA;

/// For each MSOA, return all building centroids within.
///
/// Lots of caveats about what counts as a home or work building!
pub fn get_buildings_per_msoa(
    msoas: BTreeSet<MSOA>,
    osm_directories: Vec<String>,
) -> Result<BTreeMap<MSOA, Vec<Point<f64>>>> {
    info!("Loading MSOA shapes");
    let msoa_shapes = load_msoa_shapes(msoas)?;
    if false {
        dump_msoa_shapes(&msoa_shapes)?;
    }
    let mut building_centroids: Vec<Point<f64>> = Vec::new();
    for dir in osm_directories {
        // TODO Progress bars
        info!("Loading buildings from {}", dir);
        building_centroids.extend(load_building_centroids(&format!(
            "{}gis_osm_buildings_a_free_1.shp",
            dir
        ))?);
    }
    Ok(points_per_polygon(building_centroids, &msoa_shapes))
}

fn load_msoa_shapes(msoas: BTreeSet<MSOA>) -> Result<BTreeMap<MSOA, MultiPolygon<f64>>> {
    // We can't use from_path, because the file isn't named .shp.dbf as expected
    let shape_reader =
        shapefile::ShapeReader::from_path("raw_data/nationaldata/MSOAS_shp/msoas.shp")?;
    // TODO Weird error type
    // TODO BufReader doesn't work with fs_err
    let dbf_reader = shapefile::dbase::Reader::new(BufReader::new(std::fs::File::open(
        "raw_data/nationaldata/MSOAS_shp/msoas.dbf",
    )?))
    .unwrap();
    let mut reader = shapefile::Reader::new(shape_reader, dbf_reader);

    let mut results = BTreeMap::new();
    for pair in reader.iter_shapes_and_records_as::<shapefile::Polygon, shapefile::dbase::Record>()
    {
        let (shape, record) = pair?;
        if let Some(shapefile::dbase::FieldValue::Character(Some(msoa))) = record.get("MSOA11CD") {
            let msoa = MSOA(msoa.clone());
            if !msoas.contains(&msoa) {
                continue;
            }
            let mut geo_polygon: MultiPolygon<f64> = shape.try_into()?;
            reproject(&mut geo_polygon)?;
            results.insert(msoa, geo_polygon);
        }
    }
    Ok(results)
}

fn reproject(polygon: &mut MultiPolygon<f64>) -> Result<()> {
    // I opened the file in QGIS to figure out the source CRS
    let reproject = Proj::new_known_crs("EPSG:27700", "EPSG:4326", None)
        .ok_or(anyhow!("Couldn't set up CRS projection"))?;
    polygon.map_coords_inplace(|&(x, y)| {
        // TODO Error prop inside here is weird
        let pt = reproject.convert((x, y)).unwrap();
        (pt.x(), pt.y())
    });
    Ok(())
}

// TODO If this is ever removed, cleanup dependencies on geojson and serde_json
fn dump_msoa_shapes(msoa_shapes: &BTreeMap<MSOA, MultiPolygon<f64>>) -> Result<()> {
    use std::io::Write;

    let geom_collection: geo::GeometryCollection<f64> =
        msoa_shapes.values().map(|geom| geom.clone()).collect();
    let mut feature_collection = geojson::FeatureCollection::from(&geom_collection);
    for (feature, msoa) in feature_collection
        .features
        .iter_mut()
        .zip(msoa_shapes.keys())
    {
        feature.set_property("msoa11cd", msoa.0.clone());
    }
    let gj = geojson::GeoJson::from(feature_collection);
    let mut file = fs_err::File::create("msoas.geojson")?;
    write!(file, "{}", serde_json::to_string_pretty(&gj)?)?;
    Ok(())
}

fn load_building_centroids(path: &str) -> Result<Vec<Point<f64>>> {
    let mut results = Vec::new();
    for shape in shapefile::read_shapes_as::<_, shapefile::Polygon>(path)? {
        let geo_polygon: MultiPolygon<f64> = shape.try_into()?;
        if let Some(pt) = geo_polygon.centroid() {
            results.push(pt);
        }
    }
    info!(
        "Found {} buildings from {}",
        print_count(results.len()),
        path
    );
    Ok(results)
}

// TODO Share with odjitter
fn points_per_polygon<K: Clone + Ord>(
    points: Vec<Point<f64>>,
    polygons: &BTreeMap<K, MultiPolygon<f64>>,
) -> BTreeMap<K, Vec<Point<f64>>> {
    info!(
        "Matching {} points to {} polygons",
        print_count(points.len()),
        print_count(polygons.len())
    );

    let mut output = BTreeMap::new();
    for (key, _) in polygons {
        output.insert(key.clone(), Vec::new());
    }
    let pb = ProgressBar::new(points.len() as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template("[{elapsed_precise}] [{wide_bar:.cyan/blue}] {human_pos}/{human_len} ({eta})")
            .progress_chars("#-"),
    );
    for point in points {
        pb.inc(1);
        for (key, polygon) in polygons {
            if polygon.contains(&point) {
                output.get_mut(key).unwrap().push(point);
            }
        }
    }
    return output;
}
