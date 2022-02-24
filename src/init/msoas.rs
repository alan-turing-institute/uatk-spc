use std::collections::{BTreeMap, BTreeSet};
use std::io::{BufReader, Write};

use anyhow::Result;
use geo::map_coords::MapCoords;
use geo::prelude::{BoundingRect, Centroid, Contains};
use geo::{MultiPolygon, Point};
use proj::Proj;
use rstar::{RTree, AABB};

use crate::utilities::{print_count, progress_count};
use crate::{InfoPerMSOA, MSOA};

#[instrument(skip_all)]
pub fn get_info_per_msoa(
    msoas: BTreeSet<MSOA>,
    osm_directories: Vec<String>,
) -> Result<BTreeMap<MSOA, InfoPerMSOA>> {
    info!("Loading MSOA shapes");
    let mut info_per_msoa = load_msoa_shapes(msoas)?;
    if false {
        dump_msoa_shapes(&info_per_msoa)?;
    }
    let mut building_centroids: Vec<Point<f32>> = Vec::new();
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
        shapefile::ShapeReader::from_path("data/raw_data/nationaldata/MSOAS_shp/msoas.shp")?;
    // TODO Weird error type
    // TODO BufReader doesn't work with fs_err
    let dbf_reader = shapefile::dbase::Reader::new(BufReader::new(std::fs::File::open(
        "data/raw_data/nationaldata/MSOAS_shp/msoas.dbf",
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
                let geo_polygon: MultiPolygon<f64> = shape.try_into()?;
                let shape: MultiPolygon<f32> = geo_polygon.map_coords(|&(x, y)| {
                    // TODO Error handling inside here is weird
                    let pt = reproject.convert((x, y)).unwrap();
                    (pt.x() as f32, pt.y() as f32)
                });
                results.insert(
                    msoa,
                    InfoPerMSOA {
                        shape,
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
    let geom_collection: geo::GeometryCollection<f32> =
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

fn load_building_centroids(path: &str) -> Result<Vec<Point<f32>>> {
    let mut results = Vec::new();
    for shape in shapefile::read_shapes_as::<_, shapefile::Polygon>(path)? {
        let geo_polygon: MultiPolygon<f64> = shape.try_into()?;
        if let Some(pt) = geo_polygon.centroid() {
            // TODO Urgh, casting everywhere
            results.push(Point::new(pt.lng() as f32, pt.lat() as f32));
        }
    }
    info!(
        "Found {} buildings from {}",
        print_count(results.len()),
        path
    );
    Ok(results)
}

fn match_points_to_shapes(points: Vec<Point<f32>>, msoas: &mut BTreeMap<MSOA, InfoPerMSOA>) {
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
    points: Vec<Point<f32>>,
    polygons: &BTreeMap<K, MultiPolygon<f32>>,
) -> BTreeMap<K, Vec<Point<f32>>> {
    info!(
        "Matching {} points to {} polygons. Building R-Tree...",
        print_count(points.len()),
        print_count(polygons.len())
    );
    let cast_points: Vec<Point<f32>> = points
        .into_iter()
        .map(|pt| Point::new(pt.lng(), pt.lat()))
        .collect();
    let tree = RTree::bulk_load(cast_points);

    let mut output = BTreeMap::new();
    let pb = progress_count(polygons.len());
    for (key, polygon) in polygons {
        pb.inc(1);
        let mut pts_inside = Vec::new();
        let bounds = polygon.bounding_rect().unwrap();
        let envelope: AABB<Point<f32>> =
            AABB::from_corners(bounds.min().into(), bounds.max().into());
        for pt in tree.locate_in_envelope(&envelope) {
            if polygon.contains(pt) {
                // TODO Casting
                pts_inside.push(Point::new(pt.lng(), pt.lat()));
            }
        }
        output.insert(key.clone(), pts_inside);
    }
    output
}
