from decimal import Decimal
from domain import EMPTY, apply, decide

s = apply(EMPTY, "AccountOpened", {"owner": "ana"})
for t, amt in [("MoneyDeposited", "100.10"), ("PixReceived", "50"), ("TransferReceived", "10"),
               ("MoneyWithdrawn", "0.10"), ("BillPaid", "20"), ("CardPurchased", "30"),
               ("PixSent", "5"), ("TransferSent", "5")]:
    s = apply(s, t, {"amount": amt})
assert s == {"opened": True, "owner": "ana", "balance": "100.00"}, s

assert decide(s, "pix", Decimal("100"), {"pix_key": "a@b.com", "x": 1}) == \
    ("PixSent", {"amount": "100", "pix_key": "a@b.com"})
assert decide(s, "deposit", Decimal("1"), {}) == ("MoneyDeposited", {"amount": "1"})

for bad in [(EMPTY, "deposit", Decimal(1), {}),                       # not opened
            (s, "withdraw", Decimal("100.01"), {}),                    # insufficient funds
            (s, "card-purchase", Decimal("100.01"), {"merchant": "x"}),
            (s, "deposit", Decimal(0), {}),                            # non-positive
            (s, "pay-bill", Decimal(1), {}),                           # missing barcode
            (s, "steal", Decimal(1), {})]:                             # unknown command
    try:
        decide(*bad)
        raise AssertionError(f"should fail: {bad}")
    except ValueError:
        pass
print("domain ok")
