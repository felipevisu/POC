"""Catch-up subscription on $all (account-* streams) projecting into the read DB."""
import json
import os

import psycopg
from kurrentdbclient import KurrentDBClient
from psycopg.rows import dict_row

from psycopg.types.json import Jsonb

# copy of account-service/domain.py SIGN: +1 credit, -1 debit
SIGN = {"MoneyDeposited": 1, "PixReceived": 1, "TransferReceived": 1, "MoneyWithdrawn": -1,
        "BillPaid": -1, "CardPurchased": -1, "PixSent": -1, "TransferSent": -1}


def project(rd, e):
    account = e.stream_name.removeprefix("account-")
    data = json.loads(e.data)
    if e.type == "AccountOpened":
        rd.execute(
            "INSERT INTO accounts (account_number, owner, balance, version) VALUES (%s,%s,0,%s) "
            "ON CONFLICT DO NOTHING",
            (account, data["owner"], e.stream_position),
        )
        amount, balance_after = 0, 0
    elif e.type in SIGN:
        amount = data["amount"]
        balance_after = rd.execute(
            "UPDATE accounts SET balance = balance + %s * %s::numeric, version=%s "
            "WHERE account_number=%s RETURNING balance",
            (SIGN[e.type], amount, e.stream_position, account),
        ).fetchone()["balance"]
    else:
        return  # unknown event type: skip, keeps the projection forward-compatible
    rd.execute(
        "INSERT INTO transactions VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (e.id, e.commit_position, account, e.type, amount, balance_after,
         Jsonb({k: v for k, v in data.items() if k != "amount"}), e.recorded_at),
    )


def main():
    es = KurrentDBClient(uri=os.environ["EVENTSTORE_URI"])
    with psycopg.connect(os.environ["READ_DSN"], row_factory=dict_row) as rd:
        position = rd.execute("SELECT commit_position FROM checkpoint").fetchone()["commit_position"]
        rd.commit()
        print(f"subscribing from commit_position={position}")
        # prefix filter: "account-" matches event streams, not "snapshot-account-"
        for e in es.subscribe_to_all(commit_position=position, filter_include=["account-"],
                                     filter_by_stream_name=True, filter_by_prefix=True):
            with rd.transaction():  # projection + checkpoint atomic: no double-apply on crash
                project(rd, e)
                rd.execute("UPDATE checkpoint SET commit_position=%s", (e.commit_position,))
            print(f"projected {e.type} {e.stream_name}@{e.stream_position}")


if __name__ == "__main__":
    main()
