use std::collections::{BTreeMap, BTreeSet};
use std::io::{BufReader, Write};

use anyhow::Result;
use geo::algorithm::bounding_rect::BoundingRect;
use geo::algorithm::centroid::Centroid;
use geo::algorithm::contains::Contains;
use geo::map_coords::MapCoordsInplace;
use geo::{MultiPolygon, Point};
use proj::Proj;
use rstar::{RTree, AABB};

use crate::utilities::{print_count, progress_count};
use crate::{InfoPerMSOA, MSOA};

pub fn get_info_per_msoa(
    msoas: BTreeSet<MSOA>,
    osm_directories: Vec<String>,
) -> Result<BTreeMap<MSOA, InfoPerMSOA>> {
    info!("Loading MSOA shapes");
    let mut info_per_msoa = load_msoa_shapes(msoas)?;
    if false {
        dump_msoa_shapes(&info_per_msoa)?;
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
    match_points_to_shapes(building_centroids, &mut info_per_msoa);
    Ok(info_per_msoa)
}

fn load_msoa_shapes(msoas: BTreeSet<MSOA>) -> Result<BTreeMap<MSOA, InfoPerMSOA>> {
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

    // I opened the file in QGIS to figure out the source CRS
    let reproject = Proj::new_known_crs("EPSG:27700", "EPSG:4326", None)
        .ok_or(anyhow!("Couldn't set up CRS projection"))?;

    let mut results = BTreeMap::new();
    for pair in reader.iter_shapes_and_records_as::<shapefile::Polygon, shapefile::dbase::Record>()
    {
        let (shape, record) = pair?;
        if let Some(shapefile::dbase::FieldValue::Character(Some(msoa))) = record.get("MSOA11CD") {
            let msoa = MSOA(msoa.clone());
            if !msoas.contains(&msoa) {
                continue;
            }
            if let Some(shapefile::dbase::FieldValue::Numeric(Some(population))) = record.get("pop")
            {
                let mut geo_polygon: MultiPolygon<f64> = shape.try_into()?;
                geo_polygon.map_coords_inplace(|&(x, y)| {
                    // TODO Error handling inside here is weird
                    let pt = reproject.convert((x, y)).unwrap();
                    (pt.x(), pt.y())
                });
                results.insert(
                    msoa,
                    InfoPerMSOA {
                        shape: geo_polygon,
                        population: *population as usize,
                        buildings: Vec::new(),
                    },
                );
            }
        }
    }

    Ok(results)
}

// TODO If this is ever removed, cleanup dependencies on geojson and serde_json
// TODO Also, there should be a less verbose way to do this sort of thing
fn dump_msoa_shapes(msoas: &BTreeMap<MSOA, InfoPerMSOA>) -> Result<()> {
    let geom_collection: geo::GeometryCollection<f64> =
        msoas.values().map(|info| info.shape.clone()).collect();
    let mut feature_collection = geojson::FeatureCollection::from(&geom_collection);
    for (feature, msoa) in feature_collection.features.iter_mut().zip(msoas.keys()) {
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

fn match_points_to_shapes(points: Vec<Point<f64>>, msoas: &mut BTreeMap<MSOA, InfoPerMSOA>) {
    let polygons = msoas
        .iter()
        .map(|(k, v)| (k.clone(), v.shape.clone()))
        .collect::<BTreeMap<_, _>>();
    for (key, points) in points_per_polygon(points, &polygons) {
        msoas.get_mut(&key).unwrap().buildings = points;
    }
}

/// Find all of the points contained within each polygon.
///
/// This uses an R*-tree for speedup; it works well for many points and far fewer polygons.
// TODO Share with odjitter
fn points_per_polygon<K: Clone + Ord>(
    points: Vec<Point<f64>>,
    polygons: &BTreeMap<K, MultiPolygon<f64>>,
) -> BTreeMap<K, Vec<Point<f64>>> {
    info!(
        "Matching {} points to {} polygons. Building R-Tree...",
        print_count(points.len()),
        print_count(polygons.len())
    );
    let tree = RTree::bulk_load(points);

    let mut output = BTreeMap::new();
    let pb = progress_count(polygons.len());
    for (key, polygon) in polygons {
        pb.inc(1);
        let mut pts_inside = Vec::new();
        let bounds = polygon.bounding_rect().unwrap();
        let envelope: AABB<Point<f64>> =
            AABB::from_corners(bounds.min().into(), bounds.max().into());
        for pt in tree.locate_in_envelope(&envelope) {
            if polygon.contains(pt) {
                pts_inside.push(*pt);
            }
        }
        output.insert(key.clone(), pts_inside);
    }
    output
}
