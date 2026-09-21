import http from 'k6/http';
import exec from 'k6/execution';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const API_URL = __ENV.API_URL || 'http://localhost:3000';

const usersCreated = new Counter('users_created');
const emailsQueued = new Counter('welcome_emails_queued');
const emailsNotQueued = new Counter('welcome_emails_not_queued');

export const options = {
  scenarios: {
    register: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.RATE || 10),
      timeUnit: '1s',
      duration: __ENV.DURATION || '30s',
      preAllocatedVUs: 50,
    },
  },
};

export default function () {
  // timestamp + global iteration number keeps document and email unique across runs
  const unique = `${Date.now()}${String(exec.scenario.iterationInTest).padStart(6, '0')}`;
  const res = http.post(
    `${API_URL}/users`,
    JSON.stringify({
      firstName: 'Load',
      lastName: 'Test',
      documentNumber: unique,
      email: `load-${unique}@example.com`,
      birthdate: '1990-01-01',
      phoneNumber: '+55 11 99999-9999',
      password: 'password123',
    }),
    { headers: { 'content-type': 'application/json' } },
  );

  if (!check(res, { 'user created (201)': (r) => r.status === 201 })) return;
  usersCreated.add(1);
  if (res.json('welcomeEmailQueued')) emailsQueued.add(1);
  else emailsNotQueued.add(1);
}
