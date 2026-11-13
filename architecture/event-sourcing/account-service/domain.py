"""Account aggregate: state is a pure fold over events."""
from decimal import Decimal

EMPTY = {"opened": False, "owner": None, "balance": "0"}

# +1 credits the balance, -1 debits it (projection-service keeps a copy of this map)
SIGN = {
    "MoneyDeposited": 1,
    "PixReceived": 1,
    "TransferReceived": 1,
    "MoneyWithdrawn": -1,
    "BillPaid": -1,
    "CardPurchased": -1,
    "PixSent": -1,
    "TransferSent": -1,
}

# command -> (event type, required detail fields)
COMMANDS = {
    "deposit": ("MoneyDeposited", []),
    "withdraw": ("MoneyWithdrawn", []),
    "pay-bill": ("BillPaid", ["barcode"]),
    "card-purchase": ("CardPurchased", ["merchant"]),
    "pix": ("PixSent", ["pix_key"]),
    "pix-receive": ("PixReceived", ["payer"]),  # simulates an incoming Pix from another bank
    "transfer": ("TransferSent", ["to_account"]),  # TransferReceived is emitted on the target
}


def apply(state: dict, type_: str, data: dict) -> dict:
    s = dict(state)
    if type_ == "AccountOpened":
        s.update(opened=True, owner=data["owner"])
    elif type_ in SIGN:
        s["balance"] = str(Decimal(s["balance"]) + SIGN[type_] * Decimal(data["amount"]))
    return s


def decide(state: dict, command: str, amount: Decimal, details: dict) -> tuple[str, dict]:
    """Validate a command against current state and return the event to append."""
    if command not in COMMANDS:
        raise ValueError(f"unknown command, use one of {list(COMMANDS)}")
    type_, required = COMMANDS[command]
    if not state["opened"]:
        raise ValueError("account not found")
    if amount <= 0:
        raise ValueError("amount must be positive")
    if missing := [f for f in required if not details.get(f)]:
        raise ValueError(f"missing fields: {missing}")
    if SIGN[type_] < 0 and Decimal(state["balance"]) < amount:
        raise ValueError("insufficient funds")
    return type_, {"amount": str(amount), **{f: details[f] for f in required}}
