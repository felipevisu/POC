import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";
import { SharedArray } from "k6/data";

const payloads = new SharedArray("payloads", function () {
  return JSON.parse(open("./payloads.json"));
});

const errorRateStandard = new Rate("errors_standard");
const errorRateCached = new Rate("errors_cached");
const durationStandard = new Trend("duration_standard");
const durationCached = new Trend("duration_cached");

export const options = {
  stages: [{ duration: "5m", target: 5000 }],
};

export default function () {
  const headers = { "Content-Type": "application/json" };
  const payload = payloads[Math.floor(Math.random() * payloads.length)];

  const resStandard = http.post(
    "http://localhost:8080/calculate",
    JSON.stringify(payload),
    { headers, tags: { name: "standard" } }
  );

  const standardOk = check(resStandard, {
    "standard: status 200": (r) => r.status === 200,
    "standard: has response": (r) => r.body && r.body.length > 0,
  });

  if (!standardOk) {
    errorRateStandard.add(1);
  }

  durationStandard.add(resStandard.timings.duration);

  sleep(0.05);

  const resCached = http.post(
    "http://localhost:8080/calculate-cached",
    JSON.stringify(payload),
    { headers, tags: { name: "cached" } }
  );

  const cachedOk = check(resCached, {
    "cached: status 200": (r) => r.status === 200,
    "cached: has response": (r) => r.body && r.body.length > 0,
  });

  if (!cachedOk) {
    errorRateCached.add(1);
  }

  durationCached.add(resCached.timings.duration);

  sleep(0.1);
}
