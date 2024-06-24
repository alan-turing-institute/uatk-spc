fn main() -> std::io::Result<()> {
    let mut config = prost_build::Config::new();
    // Config to use BTreeMap over HashMap for deterministic map serialization
    // See: https://github.com/tokio-rs/prost#using-prost-in-a-no_std-crate
    config
        .type_attribute(".", "#[derive(serde::Serialize,serde::Deserialize)]")
        .btree_map(["."])
        .compile_protos(&["src/synthpop.proto"], &["src/"])?;
    Ok(())
}
