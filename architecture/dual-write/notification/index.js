const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/notifications',
});

// simulated provider latency
const DELAY_MS = Number(process.env.DELAY_MS ?? 100);

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS notification_requests (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    email TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS emails_sent (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES notification_requests (id),
    source TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

const app = express();
app.use(express.json());

app.post('/welcome-email', async (req, res) => {
  // source tags the caller (version1, version2, ...) so each version can be compared on its own
  const { source, userId, email, firstName } = req.body ?? {};
  if (typeof source !== 'string' || !/^[\w.-]{1,50}$/.test(source) ||!/^\d+$/.test(String(userId)) || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'source, userId and email are required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO notification_requests (source, user_id, email) VALUES ($1, $2, $3) RETURNING id',
      [source, userId, email],
    );
    const requestId = rows[0].id;

    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    const subject = `Welcome, ${firstName || 'there'}!`;
    await pool.query(
      'INSERT INTO emails_sent (request_id, source, user_id, email, subject) VALUES ($1, $2, $3, $4, $5)',
      [requestId, source, userId, email, subject],
    );
    console.log(`request ${requestId}: sent "${subject}" to ${email} (${source})`);
    res.status(202).json({ requestId, sent: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

const port = process.env.PORT || 3000;
pool.query(SCHEMA).then(() => app.listen(port, () => console.log(`notification listening on :${port}`)));
