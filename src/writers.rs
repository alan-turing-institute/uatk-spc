//! Serialization to various file types.
use std::collections::BTreeMap;
use std::io::Write;

use anyhow::Result;
use arrow2::{
    array::Array,
    chunk::Chunk,
    datatypes::Schema,
    io::parquet::write::{
        transverse, CompressionOptions, Encoding, FileWriter, RowGroupIterator, Version,
        WriteOptions,
    },
};

use enum_map::EnumMap;
use serde::Serialize;
use serde_arrow::{
    arrow2::{serialize_into_arrays, serialize_into_fields},
    schema::TracingOptions,
};
use typed_index_collections::TiVec;

use crate::{
    pb::{self, Point, VenueList},
    VenueID,
};

pub trait WriteParquet {
    fn write_parquet(&self, output: &str) -> Result<()>;
}

pub trait WriteJSON {
    fn write_json(&self, output: &str) -> Result<()>
    where
        Self: Serialize,
    {
        let mut f = std::fs::File::create(output).unwrap();
        write!(f, "{}", serde_jcs::to_string(self).unwrap())?;
        Ok(())
    }
}

impl<K, V> WriteParquet for TiVec<K, V>
where
    V: Serialize,
{
    fn write_parquet(&self, output: &str) -> Result<()> {
        let fields = serialize_into_fields(
            self,
            TracingOptions {
                allow_null_fields: true,
                ..Default::default()
            },
        )?;
        let arrays = serialize_into_arrays(&fields, self)?;
        write_chunk(output, Schema::from(fields), Chunk::new(arrays))?;
        Ok(())
    }
}

impl<V> WriteParquet for prost::alloc::vec::Vec<V>
where
    V: Serialize,
{
    fn write_parquet(&self, output: &str) -> Result<()> {
        let fields = serialize_into_fields(
            self,
            TracingOptions {
                allow_null_fields: true,
                ..Default::default()
            },
        )?;
        let arrays = serialize_into_arrays(&fields, self)?;
        write_chunk(output, Schema::from(fields), Chunk::new(arrays))?;
        Ok(())
    }
}

// Version of Venue that can be serialized to parquet.
#[derive(Serialize)]
struct ArrowVenue {
    id: u64,
    activity: String,
    location: Point,
    urn: Option<String>,
}

impl From<&pb::Venue> for ArrowVenue {
    fn from(venue: &pb::Venue) -> Self {
        Self {
            id: venue.id,
            activity: format!("{}", venue.activity),
            location: venue.location.clone(),
            urn: venue.urn.clone(),
        }
    }
}

impl<K> WriteParquet for BTreeMap<K, VenueList> {
    fn write_parquet(&self, output: &str) -> Result<()> {
        self.iter()
            .flat_map(|(_, venues)| venues.venues.iter().map(ArrowVenue::from))
            .collect::<TiVec<VenueID, ArrowVenue>>()
            .write_parquet(output)
    }
}

/// Writes an arrow2 `Array` to parquet.
fn write_chunk(path: &str, schema: Schema, chunk: Chunk<Box<dyn Array>>) -> Result<()> {
    let options = WriteOptions {
        write_statistics: true,
        compression: CompressionOptions::Uncompressed,
        version: Version::V2,
        data_pagesize_limit: None,
    };
    let iter = vec![Ok(chunk)];
    let encodings = schema
        .fields
        .iter()
        .map(|f| transverse(&f.data_type, |_| Encoding::Plain))
        .collect();

    let row_groups = RowGroupIterator::try_new(iter.into_iter(), &schema, options, encodings)?;

    let file = std::fs::File::create(path)?;
    let mut writer = FileWriter::try_new(file, schema, options)?;
    for group in row_groups {
        writer.write(group?)?;
    }
    let _size = writer.end(None)?;
    Ok(())
}

impl<K, V> WriteJSON for BTreeMap<K, V> where Self: Serialize {}

impl<E, K, V> WriteJSON for EnumMap<E, TiVec<K, V>>
where
    Self: Serialize,
    E: enum_map::EnumArray<typed_index_collections::TiVec<K, V>>,
{
}
