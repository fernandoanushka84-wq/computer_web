import io

from openpyxl import Workbook

from backend.app.excel_import import parse_excel_products


def test_parse_excel_products():
    workbook = Workbook()
    sheet = workbook.active
    sheet.append(["name", "slug", "description", "price", "stock_quantity", "image_url", "category_name", "is_featured", "is_active"])
    sheet.append(["RTX 4070", "rtx-4070", "Powerful GPU", 1299.99, 10, "https://example.com/rtx.jpg", "Graphics Cards", True, True])

    stream = io.BytesIO()
    workbook.save(stream)
    stream.seek(0)

    rows = parse_excel_products(stream.getvalue())

    assert len(rows) == 1
    assert rows[0]["name"] == "RTX 4070"
    assert rows[0]["price"] == 1299.99
    assert rows[0]["category_name"] == "Graphics Cards"
    assert rows[0]["is_featured"] is True
