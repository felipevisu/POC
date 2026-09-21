const crypto = require('node:crypto');
const { promisify } = require('node:util');
const amqp = require('amqplib');
const express = require('express');
const { Pool } = require('pg');

const scrypt = promisify(crypto.scrypt);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/users',
});

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    document_number TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    birthdate DATE NOT NULL,
    phone_number TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

const isValidDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s);
  // round trip rejects things like 2023-02-30
  return !isNaN(d) && d.toISOString().slice(0, 10) === s && d < new Date();
};

const RULES = {
  firstName: (v) => v.trim().length > 0 && v.length <= 100,
  lastName: (v) => v.trim().length > 0 && v.length <= 100,
  documentNumber: (v) => /^[\d.\-/]{5,20}$/.test(v),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254,
  birthdate: isValidDate,
  phoneNumber: (v) => /^\+?[\d\s()-]{8,20}$/.test(v),
  password: (v) => v.length >= 8 && v.length <= 128,
};

// returns the list of invalid field names
const validate = (body) =>
  Object.entries(RULES)
    .filter(([field, ok]) => typeof body?.[field] !== 'string' || !ok(body[field]))
    .map(([field]) => field);

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbit:rabbit@localhost:5672';
const QUEUE = 'welcome-emails';

// one shared confirm channel, opened on first use and reopened after a connection loss
let channelPromise;
const getChannel = () => {
  channelPromise ??= amqp
    .connect(RABBITMQ_URL)
    .then(async (connection) => {
      connection.on('error', (err) => console.error(`rabbitmq: ${err.message}`));
      connection.on('close', () => { channelPromise = undefined; });
      const channel = await connection.createConfirmChannel();
      await channel.assertQueue(QUEUE, { durable: true });
      return channel;
    })
    .catch((err) => {
      channelPromise = undefined;
      throw err;
    });
  return channelPromise;
};

// the email is no longer sent here: it is queued, and stays queued while the notification service is down.
// still a dual write (database, then broker): if rabbitmq itself is down the email is lost
const queueWelcomeEmail = async (userId, email, firstName) => {
  try {
    const channel = await getChannel();
    const message = Buffer.from(JSON.stringify({ source: 'version2', userId, email, firstName }));
    // resolves only when the broker confirms it has the persistent message
    await new Promise((resolve, reject) =>
      channel.sendToQueue(QUEUE, message, { persistent: true }, (err) => (err ? reject(err) : resolve())),
    );
    return true;
  } catch (err) {
    console.error(`welcome email for user ${userId} not queued: ${err.message}`);
    return false;
  }
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
};

const app = express();
app.use(express.json());

app.post('/users', async (req, res) => {
  const invalid = validate(req.body);
  if (invalid.length) return res.status(400).json({ error: 'invalid fields', fields: invalid });

  const { firstName, lastName, documentNumber, email, birthdate, phoneNumber, password } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, document_number, email, birthdate, phone_number, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [firstName.trim(), lastName.trim(), documentNumber, email.toLowerCase(), birthdate, phoneNumber, await hashPassword(password)],
    );
    const welcomeEmailQueued = await queueWelcomeEmail(rows[0].id, email.toLowerCase(), firstName.trim());
    res.status(201).json({
      id: rows[0].id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      documentNumber,
      email: email.toLowerCase(),
      birthdate,
      phoneNumber,
      createdAt: rows[0].created_at,
      welcomeEmailQueued,
    });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'document number or email already registered' });
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  pool.query(SCHEMA).then(() => app.listen(port, () => console.log(`listening on :${port}`)));
}

module.exports = { validate };
