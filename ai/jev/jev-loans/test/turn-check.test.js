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
