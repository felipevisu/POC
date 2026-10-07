import { readFileSync, readdirSync } from 'node:fs';

const runs = new URL('./runs/', import.meta.url);
const latest = () => new URL(readdirSync(runs).filter((f) => f.endsWith('.json')).sort().at(-1), runs);
const file = process.argv[2] ?? latest();
const { results } = JSON.parse(readFileSync(file, 'utf8')).results;

const usd = (x) => `$${x.toFixed(4)}`;
const by = {};
for (const r of results) {
  const o = r.response?.output ?? {};
  const b = (by[r.provider.label] ??= { n: 0, pass: 0, order: 0, turn: 0, chat: 0, router: 0, ms: 0, errors: 0, ignored: 0, input: 0, cached: 0, cache: false });
  b.n++;
  b.pass += r.success ? 1 : 0;
  b.order += o.expected_total != null && o.expected_hit === o.expected_total ? 1 : 0;
  b.turn += o.turn_ok ? 1 : 0;
  b.chat += o.chat_cost_usd ?? 0;
  b.router += o.router_cost_usd ?? 0;
  b.ms += o.ms ?? 0;
  b.errors += o.tool_errors ?? 0;
  b.ignored += o.route_ignored ?? 0;
  b.input += o.input_tokens ?? 0;
  b.cached += o.cache_read_tokens ?? 0;
  b.cache ||= !!o.cache;
  console.log(`${r.success ? '✓' : '✗'} ${r.vars.scenario.padEnd(22)} ${r.provider.label.padEnd(11)} ${usd(o.cost_usd ?? 0)} ${String(o.ms ?? 0).padStart(6)}ms  ${(o.calls ?? []).join(' → ')}`);
}

console.table(Object.fromEntries(Object.entries(by).map(([mode, b]) => [mode, {
  pass: `${b.pass}/${b.n}`,
  right_order: `${b.order}/${b.n}`,
  right_turn: `${b.turn}/${b.n}`,
  total_usd: usd(b.chat + b.router),
  chat_usd: usd(b.chat),
  router_usd: usd(b.router),
  usd_per_scenario: usd((b.chat + b.router) / b.n),
  usd_per_passing_scenario: b.pass ? usd((b.chat + b.router) / b.pass) : '—',
  avg_ms: Math.round(b.ms / b.n),
  tool_errors: b.errors,
  route_ignored: b.ignored,
  cache: b.cache ? 'on' : 'off',
  input_from_cache: b.input ? `${Math.round((100 * b.cached) / b.input)}%` : '—',
}])));
