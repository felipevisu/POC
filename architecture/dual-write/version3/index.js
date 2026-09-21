const crypto = require('node:crypto');
const { promisify } = require('node:util');
const amqp = require('amqplib');
const express = require('express');
const { Pool } = require('pg');

const scrypt = promisify(crypto.scrypt);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/users',
});

pool.on('error', (err) => console.error(`idle database connection lost: ${err.message}`));

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

const validate = (body) =>
  Object.entries(RULES)
    .filter(([field, ok]) => typeof body?.[field] !== 'string' || !ok(body[field]))
    .map(([field]) => field);

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbit:rabbit@localhost:5672';
const QUEUE = 'welcome-emails';

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

const queueWelcomeEmail = async (userId, email, firstName) => {
  const channel = await getChannel();
  const message = Buffer.from(JSON.stringify({ source: 'version3', userId, email, firstName }));
  await new Promise((resolve, reject) =>
    channel.sendToQueue(QUEUE, message, { persistent: true }, (err) => (err ? reject(err) : resolve())),
  );
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
  const passwordHash = await hashPassword(password);

  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error(`database unavailable: ${err.message}`);
    return res.status(503).json({ error: 'registration unavailable, nothing was saved, try again' });
  }
  const onClientError = (err) => console.error(`database connection lost: ${err.message}`);
  client.on('error', onClientError);
  let broken;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO users (first_name, last_name, document_number, email, birthdate, phone_number, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [firstName.trim(), lastName.trim(), documentNumber, email.toLowerCase(), birthdate, phoneNumber, passwordHash],
    );

    try {
      await queueWelcomeEmail(rows[0].id, email.toLowerCase(), firstName.trim());
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`registration of ${email.toLowerCase()} rolled back, welcome email not queued: ${err.message}`);
      return res.status(503).json({ error: 'registration unavailable, nothing was saved, try again' });
    }

    await client.query('COMMIT');
    res.status(201).json({
      id: rows[0].id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      documentNumber,
      email: email.toLowerCase(),
      birthdate,
      phoneNumber,
      createdAt: rows[0].created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') return res.status(409).json({ error: 'document number or email already registered' });
    broken = err;
    console.error(`registration of ${email.toLowerCase()} failed after the welcome email step: ${err.message}`);
    res.status(500).json({ error: 'internal error' });
  } finally {
    client.removeListener('error', onClientError);
    client.release(broken);
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  pool.query(SCHEMA).then(() => app.listen(port, () => console.log(`listening on :${port}`)));
}

module.exports = { validate };
