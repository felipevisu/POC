import psycopg2
from flask import Flask, jsonify, request
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "webmotors",
    "user": "webmotors",
    "password": "webmotors",
}

RANGE_FILTERS = {
    "year_from",
    "year_to",
    "length_mm",
    "width_mm",
    "height_mm",
    "wheelbase_mm",
    "front_track_mm",
    "rear_track_mm",
    "curb_weight_kg",
    "ground_clearance_mm",
    "payload_kg",
    "full_weight_kg",
    "max_trunk_capacity_l",
    "minimum_trunk_capacity_l",
    "number_of_cylinders",
    "compression_ratio",
    "valves_per_cylinder",
    "cylinder_bore_mm",
    "stroke_cycle_mm",
    "max_power_kw",
    "capacity_cm3",
    "engine_hp",
    "number_of_gears",
    "turning_circle_m",
    "mixed_fuel_consumption_per_100_km_l",
    "fuel_tank_capacity_l",
    "acceleration_0_100_km_h_s",
    "max_speed_km_per_h",
    "city_fuel_per_100km_l",
    "highway_fuel_per_100km_l",
    "co2_emissions_g_per_km",
    "number_of_doors",
    "load_height_mm",
    "cargo_volume_m3",
    "battery_capacity_kw_per_h",
    "electric_range_km",
    "charging_time_h",
}

SELECT_FILTERS = {
    "make",
    "model",
    "body_type",
    "number_of_seats",
    "injection_type",
    "cylinder_layout",
    "engine_type",
    "boost_type",
    "engine_placement",
    "drive_wheels",
    "transmission",
    "emission_standards",
    "fuel_grade",
    "rear_brakes",
    "front_brakes",
    "car_class",
    "country_of_origin",
    "safety_assessment",
    "rating_name",
    "presence_of_intercooler",
}

SEARCH_FILTERS = {
    "generation",
    "series",
    "trim",
    "wheel_size_r14",
    "front_suspension",
    "back_suspension",
    "maximum_torque_n_m",
    "range_km",
}

ALL_FILTERS = {
    **{col: "range" for col in RANGE_FILTERS},
    **{col: "select" for col in SELECT_FILTERS},
    **{col: "search" for col in SEARCH_FILTERS},
}

ALLOWED_SORT_COLUMNS = set(ALL_FILTERS.keys()) | {"id_trim"}


def get_conn():
    return psycopg2.connect(**DB_CONFIG)


@app.get("/filters")
def get_filters():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    filters = {}

    for col, ftype in ALL_FILTERS.items():
        if ftype == "range":
            cur.execute(f"SELECT MIN({col}) AS min, MAX({col}) AS max FROM vehicles")
            row = cur.fetchone()
            filters[col] = {"type": "range", "min": row["min"], "max": row["max"]}

        elif ftype == "select":
            cur.execute(
                f"SELECT {col} AS value, COUNT(*) AS count "
                f"FROM vehicles WHERE {col} IS NOT NULL "
                f"GROUP BY {col} ORDER BY count DESC"
            )
            options = [dict(r) for r in cur.fetchall()]
            filters[col] = {"type": "select", "options": options}

        elif ftype == "search":
            filters[col] = {"type": "search"}

    cur.close()
    conn.close()

    return jsonify(filters)


@app.post("/vehicles/search")
def search_vehicles():
    body = request.get_json(silent=True) or {}
    filters = body.get("filters", {})
    page = max(1, body.get("page", 1))
    page_size = min(100, max(1, body.get("page_size", 20)))
    sort_by = body.get("sort_by", "id_trim")
    sort_order = "DESC" if body.get("sort_order", "asc").lower() == "desc" else "ASC"

    if sort_by not in ALLOWED_SORT_COLUMNS:
        sort_by = "id_trim"

    clauses = []
    params = []

    for col, value in filters.items():
        if col not in ALL_FILTERS:
            continue

        ftype = ALL_FILTERS[col]

        if ftype == "range" and isinstance(value, dict):
            if "min" in value and value["min"] is not None:
                clauses.append(f"{col} >= %s")
                params.append(value["min"])
            if "max" in value and value["max"] is not None:
                clauses.append(f"{col} <= %s")
                params.append(value["max"])

        elif ftype == "select" and isinstance(value, list) and value:
            placeholders = ", ".join(["%s"] * len(value))
            clauses.append(f"{col} IN ({placeholders})")
            params.extend(value)

        elif ftype == "search" and isinstance(value, str) and value.strip():
            clauses.append(f"{col} ILIKE %s")
            params.append(f"%{value.strip()}%")

    where = "WHERE " + " AND ".join(clauses) if clauses else ""
    offset = (page - 1) * page_size

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"SELECT COUNT(*) AS total FROM vehicles {where}", params)
    total = cur.fetchone()["total"]

    cur.execute(
        f"SELECT * FROM vehicles {where} "
        f"ORDER BY {sort_by} {sort_order} "
        f"LIMIT %s OFFSET %s",
        params + [page_size, offset],
    )
    rows = [dict(r) for r in cur.fetchall()]

    cur.close()
    conn.close()

    return jsonify(
        {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
            "data": rows,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=8000)
