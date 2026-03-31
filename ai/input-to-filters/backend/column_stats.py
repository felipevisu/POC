import json
from decimal import Decimal

import psycopg2
import psycopg2.extras

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "webmotors",
    "user": "webmotors",
    "password": "webmotors",
}

TABLE = "vehicles"
OUTPUT_FILE = "column_stats.json"


def serialize(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Not serializable: {type(obj)}")


def get_columns(cur):
    cur.execute(
        """
        SELECT column_name, data_type, character_maximum_length,
               numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_name = %s
        ORDER BY ordinal_position
    """,
        (TABLE,),
    )
    return cur.fetchall()


def numeric_stats(cur, col):
    cur.execute(
        f"""
        SELECT
            COUNT(*)                                    AS total_rows,
            COUNT({col})                                AS non_null_count,
            COUNT(*) - COUNT({col})                     AS null_count,
            ROUND(100.0 * (COUNT(*) - COUNT({col})) / COUNT(*), 2)
                                                        AS null_pct,
            COUNT(DISTINCT {col})                       AS distinct_count,
            MIN({col})                                  AS min,
            MAX({col})                                  AS max,
            ROUND(AVG({col})::numeric, 2)               AS mean,
            ROUND(STDDEV({col})::numeric, 2)            AS stddev,
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY {col}) AS p25,
            PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY {col}) AS median,
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY {col}) AS p75
        FROM {TABLE}
    """
    )
    row = cur.fetchone()
    stats = dict(row)

    cur.execute(
        f"""
        SELECT {col} AS value, COUNT(*) AS count
        FROM {TABLE}
        WHERE {col} IS NOT NULL
        GROUP BY {col}
        ORDER BY count DESC
        LIMIT 10
    """
    )
    stats["top_values"] = [dict(r) for r in cur.fetchall()]
    return stats


def text_stats(cur, col):
    cur.execute(
        f"""
        SELECT
            COUNT(*)                                    AS total_rows,
            COUNT({col})                                AS non_null_count,
            COUNT(*) - COUNT({col})                     AS null_count,
            ROUND(100.0 * (COUNT(*) - COUNT({col})) / COUNT(*), 2)
                                                        AS null_pct,
            COUNT(DISTINCT {col})                       AS distinct_count,
            MIN(LENGTH({col}))                          AS min_length,
            MAX(LENGTH({col}))                          AS max_length,
            ROUND(AVG(LENGTH({col}))::numeric, 2)       AS avg_length
        FROM {TABLE}
    """
    )
    row = cur.fetchone()
    stats = dict(row)

    cur.execute(
        f"""
        SELECT {col} AS value, COUNT(*) AS count
        FROM {TABLE}
        WHERE {col} IS NOT NULL
        GROUP BY {col}
        ORDER BY count DESC
        LIMIT 10
    """
    )
    stats["top_values"] = [dict(r) for r in cur.fetchall()]

    cur.execute(
        f"""
        SELECT {col} AS value, COUNT(*) AS count
        FROM {TABLE}
        WHERE {col} IS NOT NULL
        GROUP BY {col}
        ORDER BY count ASC
        LIMIT 5
    """
    )
    stats["rarest_values"] = [dict(r) for r in cur.fetchall()]
    return stats


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    columns = get_columns(cur)
    total_rows = None
    results = {}

    for col in columns:
        col_name = col["column_name"]
        data_type = col["data_type"]
        max_len = col["character_maximum_length"]
        num_prec = col["numeric_precision"]
        num_scale = col["numeric_scale"]
        print(f"  {col_name} ({data_type})")

        if data_type in (
            "integer",
            "numeric",
            "bigint",
            "smallint",
            "double precision",
        ):
            stats = numeric_stats(cur, col_name)
            col_type = "numeric"
        else:
            stats = text_stats(cur, col_name)
            col_type = "text"

        if total_rows is None:
            total_rows = stats["total_rows"]

        type_info = {"data_type": data_type}
        if max_len:
            type_info["max_length"] = max_len
        if num_prec:
            type_info["precision"] = num_prec
            type_info["scale"] = num_scale

        results[col_name] = {
            "column_type": col_type,
            "schema": type_info,
            **stats,
        }

    output = {
        "table": TABLE,
        "total_rows": total_rows,
        "columns": results,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, default=serialize)

    print(f"\nWrote stats for {len(results)} columns to {OUTPUT_FILE}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
