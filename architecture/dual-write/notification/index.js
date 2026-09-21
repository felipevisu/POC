const amqp = require('amqplib');
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/notifications',
});

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbit:rabbit@localhost:5672';
const QUEUE = 'welcome-emails';

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

const isValid = ({ source, userId, email } = {}) =>
  typeof source === 'string' && /^[\w.-]{1,50}$/.test(source) && /^\d+$/.test(String(userId)) && typeof email === 'string' && email.includes('@');

// records the request, then "sends" the email; shared by the HTTP endpoint and the queue consumer
// source tags the caller (version1, version2, ...) so each version can be compared on its own
const sendWelcomeEmail = async ({ source, userId, email, firstName }) => {
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
  return requestId;
};

const app = express();
app.use(express.json());

app.post('/welcome-email', async (req, res) => {
  if (!isValid(req.body)) return res.status(400).json({ error: 'source, userId and email are required' });
  try {
    res.status(202).json({ requestId: await sendWelcomeEmail(req.body), sent: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

// messages are acked only after the email is recorded, so anything in flight when the service
// dies goes back to the queue (at-least-once: a crash between send and ack means a duplicate email)
const consume = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    connection.on('error', (err) => console.error(`rabbitmq: ${err.message}`));
    connection.on('close', () => setTimeout(consume, 2000));
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    await channel.prefetch(10);
    await channel.consume(QUEUE, async (msg) => {
      if (!msg) return; // consumer cancelled by the broker
      let payload;
      try {
        payload = JSON.parse(msg.content.toString());
      } catch {}
      if (!isValid(payload)) {
        console.error(`dropping invalid message: ${msg.content.toString().slice(0, 200)}`);
        return channel.nack(msg, false, false);
      }
      let sent = false;
      try {
        await sendWelcomeEmail(payload);
        sent = true;
      } catch (err) {
        console.error(err);
      }
      try {
        // ponytail: immediate requeue spins if the database is down, add a dead-letter queue with backoff if that matters
        if (sent) channel.ack(msg);
        else channel.nack(msg, false, true);
      } catch (err) {
        // the connection died while this message was in flight: the broker redelivers it after the reconnect
        console.error(`could not settle message for user ${payload.userId}: ${err.message}`);
      }
    });
    console.log(`consuming ${QUEUE}`);
  } catch (err) {
    console.error(`rabbitmq unavailable, retrying: ${err.message}`);
    setTimeout(consume, 2000);
  }
};

const port = process.env.PORT || 3000;
pool.query(SCHEMA).then(() => {
  app.listen(port, () => console.log(`notification listening on :${port}`));
  consume();
});
