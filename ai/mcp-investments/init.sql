-- Prices are "as of" 2026-10-01 (current_price = last price_history close).

CREATE TABLE IF NOT EXISTS investments (
  id             SERIAL PRIMARY KEY,
  ticker         TEXT    NOT NULL,
  name           TEXT    NOT NULL,
  asset_class    TEXT    NOT NULL CHECK (asset_class IN ('stock','bond','etf','crypto','reit')),
  sector         TEXT    NOT NULL CHECK (sector IN ('tech','health','energy','finance','consumer','real_estate','broad_market','government','crypto')),
  account        TEXT    NOT NULL CHECK (account IN ('brokerage','ira','401k')),
  quantity       NUMERIC NOT NULL CHECK (quantity > 0),
  buy_price      NUMERIC NOT NULL CHECK (buy_price > 0),
  current_price  NUMERIC NOT NULL CHECK (current_price > 0),
  buy_date       DATE    NOT NULL,
  dividend_yield NUMERIC NOT NULL DEFAULT 0 CHECK (dividend_yield >= 0)  -- annual %, on cost
);

INSERT INTO investments (ticker, name, asset_class, sector, account, quantity, buy_price, current_price, buy_date, dividend_yield) VALUES
  -- tech
  ('AAPL',  'Apple',                 'stock', 'tech',     'brokerage',   50,  145.00,  228.50, '2022-03-14', 0.45),
  ('AAPL',  'Apple',                 'stock', 'tech',     'ira',         25,  172.00,  228.50, '2023-08-02', 0.45),
  ('MSFT',  'Microsoft',             'stock', 'tech',     'ira',         30,  280.00,  435.20, '2022-09-01', 0.75),
  ('NVDA',  'NVIDIA',                'stock', 'tech',     'brokerage',   80,   42.00,  138.90, '2023-01-20', 0.03),
  ('GOOGL', 'Alphabet',              'stock', 'tech',     'brokerage',   40,  102.00,  176.40, '2023-02-15', 0.45),
  ('META',  'Meta Platforms',        'stock', 'tech',     'ira',         15,  185.00,  590.30, '2023-03-08', 0.35),
  ('AMD',   'Advanced Micro Devices','stock', 'tech',     'brokerage',   60,  160.00,  142.80, '2024-03-05', 0),
  ('ORCL',  'Oracle',                'stock', 'tech',     '401k',        25,   88.00,  172.60, '2022-12-01', 0.95),
  ('CRM',   'Salesforce',            'stock', 'tech',     'brokerage',   20,  265.00,  248.10, '2024-02-20', 0.60),
  ('ADBE',  'Adobe',                 'stock', 'tech',     'ira',         12,  610.00,  498.30, '2024-01-25', 0),
  ('INTC',  'Intel',                 'stock', 'tech',     'brokerage',  150,   44.00,   22.40, '2022-01-18', 1.50),
  -- health
  ('JNJ',   'Johnson & Johnson',     'stock', 'health',   '401k',        40,  170.00,  155.30, '2023-05-11', 3.10),
  ('PFE',   'Pfizer',                'stock', 'health',   'brokerage',  120,   48.00,   26.10, '2022-06-08', 6.20),
  ('UNH',   'UnitedHealth',          'stock', 'health',   'ira',         10,  480.00,  515.40, '2023-06-14', 1.50),
  ('LLY',   'Eli Lilly',             'stock', 'health',   'brokerage',   12,  350.00,  815.20, '2023-01-09', 0.70),
  ('MRK',   'Merck',                 'stock', 'health',   '401k',        50,  105.00,   98.40, '2023-09-19', 3.00),
  ('ABBV',  'AbbVie',                'stock', 'health',   'ira',         30,  140.00,  188.60, '2022-10-04', 3.40),
  -- energy
  ('XOM',   'Exxon Mobil',           'stock', 'energy',   'ira',         60,   88.00,  117.40, '2022-02-17', 3.30),
  ('CVX',   'Chevron',               'stock', 'energy',   'brokerage',   25,  160.00,  152.80, '2024-04-02', 4.20),
  ('COP',   'ConocoPhillips',        'stock', 'energy',   'brokerage',   40,  118.00,  104.50, '2023-04-12', 2.90),
  ('SLB',   'Schlumberger',          'stock', 'energy',   '401k',        70,   52.00,   39.80, '2023-07-06', 2.70),
  ('NEE',   'NextEra Energy',        'stock', 'energy',   'ira',         45,   78.00,   74.20, '2022-05-23', 2.80),
  -- finance
  ('JPM',   'JPMorgan Chase',        'stock', 'finance',  '401k',        45,  130.00,  242.60, '2023-03-15', 2.10),
  ('BAC',   'Bank of America',       'stock', 'finance',  'brokerage',  150,   34.00,   44.70, '2023-10-26', 2.30),
  ('GS',    'Goldman Sachs',         'stock', 'finance',  'brokerage',   10,  345.00,  580.20, '2023-05-30', 2.00),
  ('V',     'Visa',                  'stock', 'finance',  'ira',         30,  215.00,  312.80, '2022-07-12', 0.75),
  ('MA',    'Mastercard',            'stock', 'finance',  '401k',        15,  360.00,  525.90, '2023-01-31', 0.55),
  ('BRK.B', 'Berkshire Hathaway',    'stock', 'finance',  'brokerage',   20,  310.00,  470.10, '2023-02-27', 0),
  ('WFC',   'Wells Fargo',           'stock', 'finance',  'ira',         80,   41.00,   70.30, '2023-06-20', 2.20),
  -- consumer
  ('AMZN',  'Amazon',                'stock', 'consumer', 'brokerage',   35,   98.00,  205.70, '2022-11-10', 0),
  ('KO',    'Coca-Cola',             'stock', 'consumer', '401k',       100,   58.00,   68.90, '2022-04-05', 2.90),
  ('PG',    'Procter & Gamble',      'stock', 'consumer', 'ira',         40,  150.00,  166.20, '2023-02-02', 2.40),
  ('WMT',   'Walmart',               'stock', 'consumer', 'brokerage',   60,   48.00,   89.40, '2022-12-14', 1.00),
  ('MCD',   'McDonald''s',           'stock', 'consumer', 'brokerage',   20,  265.00,  297.50, '2023-11-08', 2.30),
  ('TSLA',  'Tesla',                 'stock', 'consumer', 'brokerage',   30,  240.00,  248.90, '2024-06-11', 0),
  ('NKE',   'Nike',                  'stock', 'consumer', 'ira',         45,  112.00,   76.30, '2023-03-21', 2.00),
  -- ETFs
  ('VOO',   'Vanguard S&P 500 ETF',          'etf', 'broad_market', '401k',       70, 360.00, 540.10, '2022-01-05', 1.30),
  ('VOO',   'Vanguard S&P 500 ETF',          'etf', 'broad_market', 'ira',        20, 410.00, 540.10, '2023-12-18', 1.30),
  ('VTI',   'Vanguard Total Stock Market',   'etf', 'broad_market', 'ira',        55, 210.00, 295.40, '2023-07-19', 1.30),
  ('VXUS',  'Vanguard Total International',  'etf', 'broad_market', '401k',      120,  55.00,  63.20, '2022-08-24', 3.10),
  ('SCHD',  'Schwab US Dividend Equity',     'etf', 'broad_market', 'brokerage', 150,  24.00,  28.70, '2023-05-03', 3.50),
  ('QQQ',   'Invesco QQQ',                   'etf', 'tech',         'brokerage',  20, 310.00, 505.80, '2023-02-09', 0.60),
  ('VGT',   'Vanguard Information Tech',     'etf', 'tech',         'ira',        15, 380.00, 620.40, '2023-04-25', 0.60),
  ('XLV',   'Health Care Select SPDR',       'etf', 'health',       'ira',        35, 130.00, 146.20, '2024-01-30', 1.50),
  ('XLE',   'Energy Select SPDR',            'etf', 'energy',       '401k',       50,  85.00,  89.60, '2022-06-28', 3.20),
  ('XLF',   'Financial Select SPDR',         'etf', 'finance',      'brokerage', 100,  33.00,  49.80, '2023-03-28', 1.50),
  -- bonds
  ('BND',   'Vanguard Total Bond Market',    'bond', 'government',   '401k',      200,  78.00,  72.90, '2022-04-21', 3.60),
  ('BND',   'Vanguard Total Bond Market',    'bond', 'government',   'ira',       100,  71.50,  72.90, '2023-10-19', 3.60),
  ('TLT',   'iShares 20+ Year Treasury',     'bond', 'government',   'ira',        90, 115.00,  91.30, '2022-08-12', 4.20),
  ('SHY',   'iShares 1-3 Year Treasury',     'bond', 'government',   'brokerage', 150,  81.00,  82.40, '2023-01-17', 3.80),
  ('TIP',   'iShares TIPS Bond',             'bond', 'government',   '401k',       80, 112.00, 108.90, '2022-09-15', 2.60),
  ('AGG',   'iShares Core US Aggregate',     'bond', 'broad_market', '401k',      100,  96.00,  98.70, '2024-02-08', 3.50),
  ('LQD',   'iShares IG Corporate Bond',     'bond', 'finance',      'brokerage',  60, 112.00, 108.60, '2024-06-18', 4.30),
  ('HYG',   'iShares High Yield Corporate',  'bond', 'finance',      'ira',        90,  74.00,  79.20, '2023-08-29', 5.80),
  -- REITs
  ('O',     'Realty Income',                 'reit', 'real_estate',  'ira',        80,  62.00,  57.40, '2023-04-04', 5.60),
  ('PLD',   'Prologis',                      'reit', 'real_estate',  'brokerage',  30, 120.00, 112.90, '2024-09-10', 3.40),
  ('AMT',   'American Tower',                'reit', 'real_estate',  '401k',       20, 210.00, 205.30, '2023-10-03', 3.20),
  ('SPG',   'Simon Property Group',          'reit', 'real_estate',  'brokerage',  25, 112.00, 172.40, '2023-01-24', 4.80),
  ('VNQ',   'Vanguard Real Estate ETF',      'reit', 'real_estate',  'ira',        60,  82.00,  91.50, '2022-11-29', 3.90),
  -- crypto
  ('BTC',   'Bitcoin',                       'crypto', 'crypto',     'brokerage',  0.5,  28000.00, 89000.00, '2023-06-01', 0),
  ('BTC',   'Bitcoin',                       'crypto', 'crypto',     'brokerage',  0.15, 62000.00, 89000.00, '2024-08-07', 0),
  ('ETH',   'Ethereum',                      'crypto', 'crypto',     'brokerage',  4,     1800.00,  3150.00, '2023-11-15', 0),
  ('SOL',   'Solana',                        'crypto', 'crypto',     'brokerage',  40,      95.00,   162.40, '2024-01-12', 0),
  ('ADA',   'Cardano',                       'crypto', 'crypto',     'brokerage',  3000,     0.38,     0.71, '2024-02-26', 0);

-- Monthly closes per ticker, from its first purchase to 2026-10-01.
-- Deterministic: geometric path from first buy_price to current_price plus a sine wobble that is 0 at both ends.
CREATE TABLE IF NOT EXISTS price_history (
  ticker TEXT    NOT NULL,
  month  DATE    NOT NULL,
  close  NUMERIC NOT NULL,
  PRIMARY KEY (ticker, month)
);

INSERT INTO price_history (ticker, month, close)
SELECT s.ticker, g.m::date,
       round((s.buy_price * power((s.current_price / s.buy_price)::float8, x.t)
              * (1 + x.amp * sin(g.k * 1.7 + ascii(s.ticker)) * sin(pi() * x.t)))::numeric, 2)
FROM (SELECT DISTINCT ON (ticker) ticker, buy_price, current_price, buy_date, asset_class
      FROM investments ORDER BY ticker, buy_date) s
CROSS JOIN LATERAL generate_series(date_trunc('month', s.buy_date), timestamp '2026-10-01', interval '1 month')
     WITH ORDINALITY AS g(m, k)
CROSS JOIN LATERAL (SELECT
  extract(epoch FROM g.m - date_trunc('month', s.buy_date))
    / extract(epoch FROM timestamp '2026-10-01' - date_trunc('month', s.buy_date)) AS t,
  CASE s.asset_class WHEN 'crypto' THEN 0.25 WHEN 'bond' THEN 0.03 ELSE 0.08 END AS amp) x;

-- Quarterly dividends (paid on the last day of each quarter) for every yielding position.
CREATE TABLE IF NOT EXISTS dividends (
  id            SERIAL  PRIMARY KEY,
  investment_id INTEGER NOT NULL REFERENCES investments(id),
  pay_date      DATE    NOT NULL,
  amount        NUMERIC NOT NULL CHECK (amount > 0)
);

INSERT INTO dividends (investment_id, pay_date, amount)
SELECT i.id, (q - interval '1 day')::date, round(i.quantity * i.buy_price * i.dividend_yield / 100 / 4, 2)
FROM investments i
CROSS JOIN LATERAL generate_series(date_trunc('quarter', i.buy_date) + interval '3 months',
                                   timestamp '2026-10-01', interval '3 months') AS q
WHERE i.dividend_yield > 0;
