import json
import os
from decimal import Decimal

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from kurrentdbclient import KurrentDBClient, NewEvent, StreamState
from kurrentdbclient.exceptions import NotFoundError, WrongCurrentVersionError
from psycopg.rows import dict_row
from pydantic import BaseModel

from domain import COMMANDS, EMPTY, apply, decide

READ_DSN = os.environ["READ_DSN"]
SNAPSHOT_EVERY = int(os.environ.get("SNAPSHOT_EVERY", "5"))

app = FastAPI(title="account-service")
es = KurrentDBClient(uri=os.environ["EVENTSTORE_URI"])


class OpenAccount(BaseModel):
    account_number: str
    owner: str


class Command(BaseModel):
    amount: Decimal
    barcode: str | None = None    # pay-bill
    merchant: str | None = None   # card-purchase
    pix_key: str | None = None    # pix
    payer: str | None = None      # pix-receive
    to_account: str | None = None  # transfer


def stream(account: str) -> str:
    return f"account-{account}"


def snapshot_stream(account: str) -> str:
    return f"snapshot-account-{account}"


def read(stream_name: str, **kw):
    try:
        return es.get_stream(stream_name, **kw)
    except NotFoundError:
        return ()


def load(account: str) -> tuple[dict, int, int]:
    """Rebuild state from latest snapshot + events after it. Returns (state, version, replayed).
    version = last stream position, -1 when the stream does not exist."""
    state, version = EMPTY, -1
    if snap := read(snapshot_stream(account), backwards=True, limit=1):
        body = json.loads(snap[0].data)
        state, version = body["state"], body["version"]
    events = read(stream(account), stream_position=version + 1)
    for e in events:
        state, version = apply(state, e.type, json.loads(e.data)), e.stream_position
    return state, version, len(events)


def append(account: str, expected_version: int, state: dict, type_: str, data: dict) -> dict:
    try:
        es.append_to_stream(  # returns the commit position, not the stream version
            stream(account),
            current_version=StreamState.NO_STREAM if expected_version < 0 else expected_version,
            events=NewEvent(type=type_, data=json.dumps(data).encode()),
        )
    except WrongCurrentVersionError:
        # another writer appended first: optimistic concurrency conflict
        raise HTTPException(409, "concurrent modification, retry")
    version = expected_version + 1
    new_state = apply(state, type_, data)
    snapshot_taken = (version + 1) % SNAPSHOT_EVERY == 0
    if snapshot_taken:
        # snapshot is only a cache: if this write fails, load() just replays more events
        snap = snapshot_stream(account)
        if version + 1 == SNAPSHOT_EVERY:
            es.set_stream_metadata(snap, metadata={"$maxCount": 1})  # keep only latest snapshot
        es.append_to_stream(snap, current_version=StreamState.ANY, events=NewEvent(
            type="AccountSnapshot", data=json.dumps({"version": version, "state": new_state}).encode()))
    return {"account_number": account, "version": version, "event": type_, "state": new_state,
            "snapshot_taken": snapshot_taken}


@app.post("/accounts", status_code=201)
def open_account(cmd: OpenAccount):
    state, version, _ = load(cmd.account_number)
    if state["opened"]:
        raise HTTPException(409, "account already exists")
    return append(cmd.account_number, version, state, "AccountOpened", {"owner": cmd.owner})


@app.post("/accounts/{account}/{command}")
def handle(account: str, command: str, body: Command):
    """command: deposit | withdraw | pay-bill | card-purchase | pix | pix-receive | transfer"""
    state, version, replayed = load(account)
    try:
        if command == "transfer" and body.to_account == account:
            raise ValueError("cannot transfer to the same account")
        type_, data = decide(state, command, body.amount, body.model_dump())
    except ValueError as e:
        raise HTTPException(404 if "not found" in str(e) else 422, str(e))

    if command != "transfer":
        return append(account, version, state, type_, data) | {"replayed_events": replayed}

    target = body.to_account
    t_state, t_version, _ = load(target)
    if not t_state["opened"]:
        raise HTTPException(404, "target account not found")
    result = append(account, version, state, type_, data)
    # shortcut: two streams, no atomicity; if this second append fails the debit stands
    # without its credit. Upgrade to a saga/process manager that retries or compensates.
    append(target, t_version, t_state, "TransferReceived",
           {"amount": data["amount"], "from_account": account})
    return result | {"replayed_events": replayed}


# ---- queries: read side (Postgres projection, eventually consistent) ----

@app.get("/accounts/{account}")
def balance(account: str):
    with psycopg.connect(READ_DSN, row_factory=dict_row) as conn:
        row = conn.execute("SELECT * FROM accounts WHERE account_number=%s", (account,)).fetchone()
    if not row:
        raise HTTPException(404, "account not found (or not projected yet)")
    return row


@app.get("/accounts/{account}/history")
def history(account: str):
    with psycopg.connect(READ_DSN, row_factory=dict_row) as conn:
        return conn.execute(
            "SELECT event_id, type, amount, balance_after, details, created_at FROM transactions "
            "WHERE account_number=%s ORDER BY commit_position",
            (account,),
        ).fetchall()


# ---- POC inspector: raw dumps of both databases for the dashboard (no auth: local demo only) ----

@app.get("/commands")
def commands():
    return {c: fields for c, (_, fields) in COMMANDS.items()}


@app.get("/debug/eventstore")
def dump_eventstore():
    events = es.read_all(backwards=True, limit=100, filter_include=["account-", "snapshot-account-"],
                         filter_by_stream_name=True, filter_by_prefix=True)
    return [{"stream": e.stream_name, "position": e.stream_position, "type": e.type,
             "data": json.loads(e.data), "commit_position": e.commit_position,
             "recorded_at": e.recorded_at} for e in events]


@app.get("/debug/readdb")
def dump_readdb():
    with psycopg.connect(READ_DSN, row_factory=dict_row) as conn:
        return {
            "accounts": conn.execute("SELECT * FROM accounts ORDER BY account_number").fetchall(),
            "transactions": conn.execute(
                "SELECT * FROM transactions ORDER BY commit_position DESC LIMIT 100").fetchall(),
            "checkpoint": conn.execute("SELECT commit_position FROM checkpoint").fetchone(),
        }


app.mount("/", StaticFiles(directory="static", html=True))  # last, so API routes win
