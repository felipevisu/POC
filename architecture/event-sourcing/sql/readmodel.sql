CREATE TABLE accounts (
  account_number TEXT PRIMARY KEY,
  owner          TEXT,
  balance        NUMERIC(14,2) NOT NULL DEFAULT 0,
  version        INT NOT NULL
);

CREATE TABLE transactions (
  event_id        UUID PRIMARY KEY,              -- idempotency: same event never projected twice
  commit_position BIGINT NOT NULL,               -- global order in the event store
  account_number  TEXT NOT NULL,
  type            TEXT NOT NULL,
  amount          NUMERIC(14,2) NOT NULL,
  balance_after   NUMERIC(14,2) NOT NULL,
  details         JSONB NOT NULL,                -- barcode, merchant, pix_key, to/from_account...
  created_at      TIMESTAMPTZ NOT NULL
);

-- last $all commit position projected; the subscription resumes from here
CREATE TABLE checkpoint (id INT PRIMARY KEY DEFAULT 1, commit_position BIGINT);
INSERT INTO checkpoint VALUES (1, NULL);
