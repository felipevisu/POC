import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockLanguageModelV3 } from 'ai/test';
import { reply, reset } from '../src/agent.js';

const usage = { inputTokens: { total: 1, noCache: 1 }, outputTokens: { total: 1, text: 1 } };
const toolCall = (id, toolName, input) => ({ content: [{ type: 'tool-call', toolCallId: id, toolName, input }], finishReason: { unified: 'tool-calls', raw: 'tool_use' } });
const text = (t) => ({ content: [{ type: 'text', text: t }], finishReason: { unified: 'stop', raw: 'end_turn' } });

test('the next turn sees earlier tool calls and results, not just the text reply', async () => {
  const script = [
    toolCall('t1', 'find_customer', '{"cpf":"33333333333"}'),
    toolCall('t2', 'send_verification_code', '{}'),
    text('Code sent, type it here.'),
    text('turn 2'),
  ];
  const model = new MockLanguageModelV3({ doGenerate: async () => ({ ...script.shift(), usage, warnings: [] }) });
  reset();
  const messages = [{ role: 'user', content: 'CPF 333.333.333-33' }];
  const first = await reply(messages, { useJev: false, model });
  messages.push(...first.messages, { role: 'user', content: '123456' });
  await reply(messages, { useJev: false, model });

  const seen = model.doGenerateCalls.at(-1).prompt.flatMap((m) => (Array.isArray(m.content) ? m.content : []));
  const tools = (type) => seen.filter((c) => c.type === type).map((c) => c.toolName);
  assert.deepEqual(tools('tool-call'), ['find_customer', 'send_verification_code']);
  assert.deepEqual(tools('tool-result'), ['find_customer', 'send_verification_code']);
});
