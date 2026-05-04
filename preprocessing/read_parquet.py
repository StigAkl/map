import sys
from pathlib import Path

import pandas as pd
import pyarrow.parquet as pq

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PATH = PROJECT_ROOT / "public" / "data" / "ais" / "hais_2026-04-21.snappy.parquet"

path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PATH

if not path.is_absolute():
    path = PROJECT_ROOT / path

if not path.exists():
    raise FileNotFoundError(
        f"Could not find parquet file: {path}\n"
        f"Usage: python {Path(__file__).name} [path-to-parquet]\n"
        f"Default path: {DEFAULT_PATH}"
    )

parquet_file = pq.ParquetFile(path)
print(f"File: {path}")
print(parquet_file.schema_arrow)
print(f"Rows: {parquet_file.metadata.num_rows}")

df = pd.read_parquet(path)
print(df.head(10).to_string())
