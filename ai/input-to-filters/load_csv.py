import csv
import io

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


def load_csv():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    with open(CSV_FILE, "r") as f:
        reader = csv.reader(f)
        raw_headers = next(reader)
        headers = [COLUMN_RENAMES.get(h, h).lower() for h in raw_headers]
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(headers)

        for row in reader:
            cleaned = [v.strip() if v.strip() != "" else None for v in row]
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
    cur.close()
    conn.close()


if __name__ == "__main__":
    load_csv()
