import http from "k6/http";
import { check } from "k6";

// Same load against both endpoints, run as separate scenarios so
// http_req_duration can be compared per library via the `library` tag.
const BASE = __ENV.BASE_URL || "http://localhost:3000";

const valid = JSON.stringify({ name: "Ana", age: 30, email: "ana@x.com" });
const invalid = JSON.stringify({ name: "A", age: 15, email: "nope" });
const params = { headers: { "Content-Type": "application/json" } };

// Sequential, not concurrent: the server is a single node process, so
// running both at once would just measure event-loop contention.
const scenario = (exec, startTime) => ({
  executor: "constant-vus",
  vus: 20,
  duration: "30s",
  startTime,
  exec,
});

export const options = {
  scenarios: {
    zod: scenario("zod", "0s"),
    yup: scenario("yup", "35s"),
  },
  thresholds: {
    // forces per-library breakdown into the end-of-test summary
    "http_req_duration{library:zod}": [],
    "http_req_duration{library:yup}": [],
  },
};

function hit(lib) {
  const tags = { library: lib };
  const ok = http.post(`${BASE}/${lib}/users`, valid, { ...params, tags });
  check(ok, { "valid -> 201": (r) => r.status === 201 });
  const bad = http.post(`${BASE}/${lib}/users`, invalid, { ...params, tags });
  check(bad, { "invalid -> 400": (r) => r.status === 400 });
}

export function zod() {
  hit("zod");
}

export function yup() {
  hit("yup");
}
