import http from 'k6/http';
import exec from 'k6/execution';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const API_URL = __ENV.API_URL || 'http://localhost:3000';

const usersCreated = new Counter('users_created');
const rejected = new Counter('registrations_rejected_503');
const failed = new Counter('registrations_failed_500');

http.setResponseCallback(http.expectedStatuses(201, 500, 503));

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

  check(res, { 'answered 201, 500 or 503': (r) => [201, 500, 503].includes(r.status) });
  if (res.status === 201) usersCreated.add(1);
  if (res.status === 503) rejected.add(1);
  if (res.status === 500) failed.add(1);
}
