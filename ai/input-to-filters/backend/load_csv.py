import csv
import io
import re

import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "webmotors",
    "user": "webmotors",
    "password": "webmotors",
}

CSV_FILE = "dataset.csv"

COLUMN_RENAMES = {
    "Modle": "model",
    "acceleration_0_100_km/h_s": "acceleration_0_100_km_h_s",
    "CO2_emissions_g/km": "co2_emissions_g_per_km",
}

DECIMAL_COMMA_COLUMNS = {
    "load_height_mm",
    "length_mm",
    "width_mm",
    "height_mm",
    "wheelbase_mm",
    "front_track_mm",
    "rear_track_mm",
    "curb_weight_kg",
    "ground_clearance_mm",
    "max_trunk_capacity_l",
    "cargo_volume_m3",
    "compression_ratio",
    "capacity_cm3",
    "fuel_tank_capacity_l",
    "max_speed_km_per_h",
    "bore_stroke_ratio",
    "battery_capacity_kw_per_h",
    "charging_time_h",
}

NUMERIC_COLUMNS = {
    "id_trim",
    "year_from",
    "year_to",
    "load_height_mm",
    "length_mm",
    "width_mm",
    "height_mm",
    "wheelbase_mm",
    "front_track_mm",
    "rear_track_mm",
    "curb_weight_kg",
    "ground_clearance_mm",
    "payload_kg",
    "back_track_width_mm",
    "front_track_width_mm",
    "full_weight_kg",
    "max_trunk_capacity_l",
    "cargo_volume_m3",
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
    "co2_emissions_g_per_km",
    "highway_fuel_per_100km_l",
    "battery_capacity_kw_per_h",
    "electric_range_km",
    "charging_time_h",
    "bore_stroke_ratio",
}

DECIMAL_COMMA_RE = re.compile(r"^(\d+),(\d+)$")


def fix_decimal_comma(value):
    m = DECIMAL_COMMA_RE.match(value)
    return f"{m.group(1)}.{m.group(2)}" if m else value


def is_numeric(value):
    try:
        float(value)
        return True
    except ValueError:
        return False


def load_csv():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    with open(CSV_FILE, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        raw_headers = next(reader)
        headers = [COLUMN_RENAMES.get(h, h).lower() for h in raw_headers]

        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(headers)

        for row in reader:
            cleaned = []
            for header, value in zip(headers, row):
                value = value.strip()
                if not value:
                    cleaned.append(None)
                elif header in DECIMAL_COMMA_COLUMNS:
                    fixed = fix_decimal_comma(value)
                    cleaned.append(fixed if is_numeric(fixed) else None)
                elif header in NUMERIC_COLUMNS and not is_numeric(value):
                    cleaned.append(None)
                else:
                    cleaned.append(value)
            writer.writerow(cleaned)

        buf.seek(0)

        columns = ", ".join(headers)
        force_null = ", ".join(headers)

        cur.execute("TRUNCATE TABLE vehicles")
        cur.copy_expert(
            f"COPY vehicles ({columns}) FROM STDIN WITH ("
            f"  FORMAT csv,"
            f"  HEADER true,"
            f"  NULL '',"
            f"  FORCE_NULL ({force_null})"
            f")",
            buf,
        )

    conn.commit()
    print(f"Loaded {cur.rowcount} rows into vehicles.")

    cur.execute(
        """
        DELETE FROM vehicles
        WHERE (
            (CASE WHEN make IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN model IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN body_type IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN engine_type IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN engine_hp IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN capacity_cm3 IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN transmission IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN drive_wheels IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN curb_weight_kg IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN length_mm IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN width_mm IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN height_mm IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN number_of_doors IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN max_speed_km_per_h IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN fuel_tank_capacity_l IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN country_of_origin IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN number_of_cylinders IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN year_from IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN year_to IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN generation IS NULL THEN 1 ELSE 0 END)
        ) >= 10
    """
    )
    conn.commit()
    print(f"Removed {cur.rowcount} sparse rows.")

    cur.execute("SELECT COUNT(*) FROM vehicles")
    remaining = cur.fetchone()[0]
    print(f"Remaining: {remaining} rows.")

    cur.close()
    conn.close()


if __name__ == "__main__":
    load_csv()
