const amqp = require('amqplib');
const { Client, Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/users';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbit:rabbit@localhost:5672';
const QUEUE = 'welcome-emails';
const BATCH = 100;
const POLL_MS = Number(process.env.POLL_MS ?? 2000);

const pool = new Pool({ connectionString: DATABASE_URL });
pool.on('error', (err) => console.error(`idle database connection lost: ${err.message}`));

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

const publishBatch = async () => {
  const channel = await getChannel();
  const client = await pool.connect();
  const onClientError = (err) => console.error(`database connection lost: ${err.message}`);
  client.on('error', onClientError);
  let broken;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT id, payload FROM outbox WHERE published_at IS NULL ORDER BY id LIMIT $1 FOR UPDATE SKIP LOCKED',
      [BATCH],
    );
    await Promise.all(
      rows.map(
        (row) =>
          new Promise((resolve, reject) =>
            channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(row.payload)), { persistent: true }, (err) =>
              err ? reject(err) : resolve(),
            ),
          ),
      ),
    );
    await client.query('UPDATE outbox SET published_at = now() WHERE id = ANY($1)', [rows.map((row) => row.id)]);
    await client.query('COMMIT');
    if (rows.length) console.log(`published ${rows.length} outbox rows`);
    return rows.length;
  } catch (err) {
    broken = err;
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.removeListener('error', onClientError);
    client.release(broken);
  }
};

let draining = false;
let again = false;
const drain = async () => {
  if (draining) {
    again = true;
    return;
  }
  draining = true;
  try {
    do {
      again = false;
      while ((await publishBatch()) === BATCH);
    } while (again);
  } catch (err) {
    console.error(`outbox drain failed, retrying on the next poll: ${err.message}`);
  } finally {
    draining = false;
  }
};

const listen = async () => {
  const client = new Client({ connectionString: DATABASE_URL });
  let retried = false;
  const retry = (err) => {
    if (retried) return;
    retried = true;
    console.error(`listen connection lost, reconnecting: ${err?.message ?? 'closed'}`);
    client.end().catch(() => {});
    setTimeout(listen, POLL_MS);
  };
  client.on('error', retry);
  client.on('end', () => retry());
  client.on('notification', drain);
  try {
    await client.connect();
    await client.query('LISTEN outbox');
    console.log('listening to the outbox');
    drain();
  } catch (err) {
    retry(err);
  }
};

listen();
setInterval(drain, POLL_MS);
