import geopandas as gpd
import pandas as pd


df1 = pd.read_parquet(
    "./public/data/ais/hais_2026-04-21.snappy.parquet"
)

df2 = pd.read_parquet(
    "./public/data/ais/hais_2026-04-22.snappy.parquet"
)

df = pd.concat([df1, df2], ignore_index=True)

if "geometry" in df.columns:
  df = df.drop(columns=["geometry"])
  
df = df[    
        [
        "mmsi",
        "date_time_utc",
        "longitude",
        "latitude",
        "speed_over_ground",
        "course_over_ground",
        "true_heading",
        "ship_type",
    ]]

df = df.dropna(subset=["longitude", "latitude"])
df = df[
    (df["longitude"].between(-180, 180)) &
    (df["latitude"].between(-90, 90))
]

gdf = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df["longitude"], df["latitude"]),
    crs="EPSG:4326",
)

gdf.to_file(
    "./public/data/ais/ais_combined.json",
    driver="GeoJSON",
)

print(f"GeoJSON laget med {len(gdf)} punkter")