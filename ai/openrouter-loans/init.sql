CREATE TABLE IF NOT EXISTS loans (
  id       SERIAL PRIMARY KEY,
  grade    TEXT    NOT NULL CHECK (grade IN ('p1','p2','p3','p4','p5')),
  fico     INTEGER NOT NULL CHECK (fico BETWEEN 0 AND 1000),
  term     INTEGER NOT NULL CHECK (term IN (12, 24, 32, 48, 64)),
  amount   NUMERIC NOT NULL CHECK (amount > 0),
  month    INTEGER NOT NULL CHECK (month BETWEEN 0 AND 12),
  year     INTEGER NOT NULL CHECK (year > 2020),
  category TEXT    NOT NULL CHECK (category IN ('automobile','health','travel','business','house'))
);

INSERT INTO loans (grade, fico, term, amount, month, year, category) VALUES
  ('p1', 780, 48,  25000.00,  3, 2024, 'automobile'),
  ('p1', 810, 64, 320000.00,  7, 2023, 'house'),
  ('p2', 720, 24,   8500.00, 11, 2025, 'travel'),
  ('p2', 690, 32,  15000.00,  2, 2026, 'health'),
  ('p3', 650, 12,   4500.00,  6, 2022, 'travel'),
  ('p3', 640, 48,  60000.00,  9, 2024, 'business'),
  ('p4', 590, 24,   3000.00,  1, 2025, 'health'),
  ('p4', 575, 32,  12000.00,  4, 2023, 'automobile'),
  ('p5', 520, 12,   2000.00,  8, 2026, 'travel'),
  ('p5', 480, 24,   5500.00, 10, 2022, 'health'),
  ('p1', 795, 64, 410000.00,  5, 2025, 'house'),
  ('p2', 705, 48,  45000.00, 12, 2024, 'business'),
  ('p3', 660, 32,  18000.00,  3, 2026, 'automobile'),
  ('p4', 600, 12,   2500.00,  7, 2023, 'travel'),
  ('p5', 510, 48,  22000.00,  2, 2025, 'business'),
  ('p1', 830, 24,   9800.00,  6, 2026, 'health'),
  ('p2', 715, 64, 280000.00, 11, 2022, 'house'),
  ('p3', 645, 24,   7200.00,  9, 2025, 'travel'),
  ('p4', 580, 48,  35000.00,  4, 2024, 'business'),
  ('p5', 495, 32,  14000.00,  8, 2023, 'automobile');
