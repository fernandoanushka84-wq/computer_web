import io
from typing import Any

import pandas as pd


def parse_excel_products(file_bytes: bytes) -> list[dict[str, Any]]:
    buffer = io.BytesIO(file_bytes)
    try:
        df = pd.read_excel(buffer)
    except Exception:
        buffer.seek(0)
        df = pd.read_csv(buffer)

    rows: list[dict[str, Any]] = []

    for _, row in df.iterrows():
        rows.append({
            "name": str(row.get("name", "")).strip(),
            "slug": str(row.get("slug", "")).strip(),
            "description": str(row.get("description", "") or "").strip(),
            "price": float(row.get("price", 0) or 0),
            "stock_quantity": int(row.get("stock_quantity", 0) or 0),
            "image_url": str(row.get("image_url", "") or "").strip(),
            "category_name": str(row.get("category_name", "") or "").strip(),
            "is_featured": bool(row.get("is_featured", False)),
            "is_active": bool(row.get("is_active", True)),
        })

    return rows
