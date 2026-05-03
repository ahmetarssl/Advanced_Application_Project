"""
Visualization Agent - sonuc grafige uygunsa Plotly JSON spec dondurur.
LLM cagirmaz - deterministik. Grafik tipini sutun tiplerine bakarak secer.
"""
from typing import Any


def suggest_chart(rows: list[dict[str, Any]]) -> dict[str, Any] | None:
    """
    Sonuc set'ine bakarak basit bir Plotly chart spec uretir.
    Kurallar:
      - 0 veya 1 satir: chart yok
      - 1 tarih sutunu + 1 numeric: line chart
      - 1 string sutunu + 1 numeric: bar chart
      - Diger: chart yok (frontend tablo gosterir)
    """
    if not rows or len(rows) < 2:
        return None

    cols = list(rows[0].keys())
    if len(cols) < 2:
        return None

    sample = rows[0]
    types: dict[str, str] = {}
    for k in cols:
        v = sample[k]
        if isinstance(v, (int, float)):
            types[k] = "number"
        elif hasattr(v, "isoformat"):  # date / datetime
            types[k] = "date"
        else:
            types[k] = "string"

    numeric_cols = [k for k, t in types.items() if t == "number"]
    string_cols  = [k for k, t in types.items() if t == "string"]
    date_cols    = [k for k, t in types.items() if t == "date"]

    # Tarih + sayi -> line chart
    if date_cols and numeric_cols:
        x = date_cols[0]
        y = numeric_cols[0]
        return {
            "type": "line",
            "x": [str(r[x]) for r in rows],
            "y": [r[y] for r in rows],
            "x_label": x,
            "y_label": y,
        }

    # String + sayi -> bar chart
    if string_cols and numeric_cols:
        x = string_cols[0]
        y = numeric_cols[0]
        return {
            "type": "bar",
            "x": [str(r[x]) for r in rows],
            "y": [r[y] for r in rows],
            "x_label": x,
            "y_label": y,
        }

    return None
