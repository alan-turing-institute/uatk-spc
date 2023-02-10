use std::collections::{BTreeMap, BTreeSet};

use anyhow::Result;
use enum_map::EnumMap;
use geo::prelude::{BoundingRect, Centroid, Contains};
use geo::{Geometry, MultiPolygon, Point};
use geojson::GeoJson;
use rstar::{RTree, AABB};

use crate::utilities::{print_count, progress_count};
use crate::{InfoPerMSOA, MSOA};

#[instrument(skip_all)]
pub fn get_info_per_msoa(
    msoas: &BTreeSet<MSOA>,
    osm_directories: Vec<String>,
) -> Result<BTreeMap<MSOA, InfoPerMSOA>> {
    info!("Loading MSOA shapes");
    let mut info_per_msoa = load_msoa_shapes(msoas)?;
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

    for (msoa, info) in &info_per_msoa {
        if info.buildings.is_empty() {
            error!("{} has no buildings", msoa.0);
        }
    }

    Ok(info_per_msoa)
}

fn load_msoa_shapes(msoas: &BTreeSet<MSOA>) -> Result<BTreeMap<MSOA, InfoPerMSOA>> {
    let raw = fs_err::read_to_string("data/raw_data/nationaldata-v2/GIS/MSOA_2011_Pop20.geojson")?;
    // TODO Use https://docs.rs/geojson/0.24.0/geojson/de/index.html? But we have Polygons and
    // MultiPolygons
    let geojson: GeoJson = raw.parse()?;

    let mut results = BTreeMap::new();
    if let GeoJson::FeatureCollection(fc) = geojson {
        for feature in fc.features {
            let msoa = MSOA(
                feature
                    .property("MSOA11CD")
                    .unwrap()
                    .as_str()
                    .unwrap()
                    .to_string(),
            );
            if !msoas.contains(&msoa) {
                continue;
            }
            let population = feature.property("PopCount").unwrap().as_u64().unwrap();
            let geom: Geometry<f32> = feature.geometry.unwrap().try_into()?;
            let shape = match geom {
                Geometry::MultiPolygon(mp) => mp,
                Geometry::Polygon(p) => MultiPolygon::new(vec![p]),
                _ => bail!("Unexpected geometry"),
            };
            results.insert(
                msoa,
                InfoPerMSOA {
                    shape,
                    population,
                    buildings: Vec::new(),
                    flows_per_activity: EnumMap::default(),
                },
            );
        }
    }
    Ok(results)
}

fn load_building_centroids(path: &str) -> Result<Vec<Point<f32>>> {
    let mut results = Vec::new();
    for shape in shapefile::read_shapes_as::<_, shapefile::Polygon>(path)? {
        let geo_polygon: MultiPolygon<f64> = shape.try_into()?;
        if let Some(pt) = geo_polygon.centroid() {
            // TODO Urgh, casting everywhere
            results.push(Point::new(pt.x() as f32, pt.y() as f32));
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
        .map(|pt| Point::new(pt.x(), pt.y()))
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
                pts_inside.push(Point::new(pt.x(), pt.y()));
            }
        }
        output.insert(key.clone(), pts_inside);
    }
    output
}
