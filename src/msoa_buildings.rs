use std::collections::{BTreeMap, BTreeSet};
use std::io::BufReader;

use anyhow::Result;
use geo::map_coords::MapCoordsInplace;
use geo::{MultiPolygon, Point};
use proj::Proj;

use crate::MSOA;

/// For each MSOA, return all building centroids within.
///
/// Lots of caveats about what counts as a home or work building!
pub fn get_buildings_per_msoa(msoas: BTreeSet<MSOA>) -> Result<BTreeMap<MSOA, Vec<Point<f64>>>> {
    let msoa_shapes = load_msoa_shapes(msoas)?;
    // Debug the MSOA we loaded by writing a new geojson
    // TODO If this is ever removed, cleanup dependencies on geojson and serde_json
    if true {
        use std::io::Write;

        let geom_collection: geo::GeometryCollection<f64> =
            msoa_shapes.values().map(|geom| geom.clone()).collect();
        let mut feature_collection = geojson::FeatureCollection::from(&geom_collection);
        for (feature, msoa) in feature_collection
            .features
            .iter_mut()
            .zip(msoa_shapes.into_keys())
        {
            feature.set_property("msoa11cd", msoa.0);
        }
        let gj = geojson::GeoJson::from(feature_collection);
        let mut file = fs_err::File::create("msoas.geojson")?;
        write!(file, "{}", serde_json::to_string_pretty(&gj)?)?;
    }

    let results = BTreeMap::new();
    Ok(results)
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
