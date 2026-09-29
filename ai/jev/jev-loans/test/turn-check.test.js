import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkTurn, scenarios } from '../eval/scenarios.js';
import { TOOL_NAMES } from '../src/agent.js';

test('checkTurn: expected tools in order, forbidden tools absent', () => {
  assert.equal(checkTurn(['a'], {}), null, 'no rule → not checked');
  assert.equal(checkTurn(['x', 'a', 'y', 'b'], { expect: ['a', 'b'] }).ok, true, 'extra calls in between are fine');
  assert.deepEqual(checkTurn(['b', 'a'], { expect: ['a', 'b'] }).missing, ['b'], 'wrong order counts as missing');
  const early = checkTurn(['send_verification_code', 'run_credit_analysis'], { forbid: ['run_credit_analysis'] });
  assert.equal(early.ok, false);
  assert.deepEqual(early.forbidden, ['run_credit_analysis']);
});

test('scenarios only name tools the agent has (a typo would make a rule silently never fire)', () => {
  for (const [name, sc] of Object.entries(scenarios)) {
    const named = [...sc.expect, ...sc.turns.flatMap((t) => (typeof t === 'string' ? [] : [...(t.expect ?? []), ...(t.forbid ?? [])]))];
    for (const tool of named) assert.ok(TOOL_NAMES.includes(tool), `${name}: unknown tool ${tool}`);
  }
});

test('jev forces the tool except for models that reject forced toolChoice', async () => {
  const { jevRouting } = await import('../src/agent.js');
  assert.equal(jevRouting('anthropic/claude-haiku-4.5'), 'forced');
  assert.equal(jevRouting('anthropic/claude-sonnet-5.5'), 'soft');
  assert.equal(jevRouting('anthropic/claude-opus-5.5'), 'soft');
});

test('--enable-cache turns caching on for the whole run and marks the run file', async () => {
  const { parseArgs, runFile } = await import('../eval/run.js');
  assert.deepEqual(parseArgs(['--filter-providers', 'sonnet', '--enable-cache']), { cache: true, promptfooArgs: ['--filter-providers', 'sonnet'] });
  assert.deepEqual(parseArgs(['-n', '1']), { cache: false, promptfooArgs: ['-n', '1'] });
  const labels = ['haiku', 'haiku+jev', 'sonnet', 'sonnet+jev', 'opus', 'opus+jev'];
  const pick = (argv) => { const f = parseArgs(argv).promptfooArgs; const re = new RegExp(f[f.indexOf('--filter-providers') + 1]); return labels.filter((l) => re.test(l)); };
  assert.deepEqual(pick(['--providers', 'sonnet']), ['sonnet', 'sonnet+jev']);
  assert.deepEqual(pick(['--providers', 'haiku']), ['haiku', 'haiku+jev']);
  assert.deepEqual(pick(['--providers', 'opus', '--enable-cache']), ['opus', 'opus+jev']);
  assert.deepEqual(pick(['--providers', 'haiku,opus']), ['haiku', 'haiku+jev', 'opus', 'opus+jev']);
  assert.throws(() => parseArgs(['--providers']), /model names/);
  assert.throws(() => parseArgs(['--providers', 'sonnet+jev']), /model names/);
  const d = new Date('2026-09-28T22:40:00Z');
  assert.equal(runFile(d, true), 'eval/runs/2026-09-28_22-40-00_cache.json');
  assert.equal(runFile(d, false), 'eval/runs/2026-09-28_22-40-00.json');

  const { default: Provider } = await import('../eval/provider.js');
  process.env.EVAL_CACHE = 'on';
  const cached = new Provider({ config: { model: 'anthropic/claude-sonnet-5.5', useJev: true } });
  process.env.EVAL_CACHE = 'off';
  const plain = new Provider({ config: { model: 'anthropic/claude-sonnet-5.5', useJev: true } });
  delete process.env.EVAL_CACHE;
  assert.equal(cached.cache, true);
  assert.equal(plain.cache, false);
  assert.notEqual(plain.id(), cached.id());
});
