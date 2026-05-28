import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const PLAYER_COUNT = 50000;

// Per-endpoint latency trends so we can see which ones are slow
const topTrend     = new Trend('lat_top',     true);
const lookupTrend  = new Trend('lat_lookup',  true);
const aroundTrend  = new Trend('lat_around',  true);
const submitTrend  = new Trend('lat_submit',  true);
const errors       = new Counter('errors');

export const options = {
  // Ramp from 0 -> 50 -> 200 VUs, hold, ramp down
  stages: [
    { duration: '10s', target: 50  },
    { duration: '20s', target: 200 },
    { duration: '20s', target: 200 },
    { duration: '10s', target: 0   },
  ],
  thresholds: {
    // Fail the test if any of these blow up
    http_req_failed:   ['rate<0.01'],   // < 1% errors
    http_req_duration: ['p(95)<50'],    // p95 under 50ms
    lat_top:           ['p(99)<100'],
    lat_lookup:        ['p(99)<100'],
  },
};

function randomPlayer() {
  const i = randomIntBetween(0, PLAYER_COUNT - 1);
  return `player:${String(i).padStart(5, '0')}`;
}

export default function () {
  const roll = Math.random();
  let res;

  if (roll < 0.75) {
    // Top 10
    res = http.get(`${BASE_URL}/leaderboard/top?n=10`, { tags: { name: 'top' } });
    topTrend.add(res.timings.duration);
    check(res, { 'top 200': r => r.status === 200 }) || errors.add(1);

  } else if (roll < 0.90) {
    // My rank
    res = http.get(`${BASE_URL}/players/${randomPlayer()}`, { tags: { name: 'lookup' } });
    lookupTrend.add(res.timings.duration);
    check(res, { 'lookup 200': r => r.status === 200 }) || errors.add(1);

  } else if (roll < 0.95) {
    // Around me
    res = http.get(`${BASE_URL}/players/${randomPlayer()}/around?radius=5`, { tags: { name: 'around' } });
    aroundTrend.add(res.timings.duration);
    check(res, { 'around 200': r => r.status === 200 }) || errors.add(1);

  } else {
    // Submit score
    const payload = JSON.stringify({
      player_id: randomPlayer(),
      delta: randomIntBetween(10, 500),
    });
    res = http.post(`${BASE_URL}/scores`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'submit' },
    });
    submitTrend.add(res.timings.duration);
    check(res, { 'submit 200': r => r.status === 200 }) || errors.add(1);
  }

  // Tiny think time so VUs don't burn one core flat
  sleep(0.05);
}