import { readFileSync } from 'node:fs';
import { experimental_evaluate as evaluate } from 'ai';

const prompt = readFileSync(new URL('./cervejaria-tools.md', import.meta.url), 'utf8');

// Table rows: | `tool` | description | params |
const tools = Object.fromEntries(
  [...prompt.matchAll(/^\| `(\w+)` \| (.+?) \|/gm)].map(([, name, desc]) => [name, desc]),
);

const result = await evaluate({
  model: 'typesafe-ai/jev',
  state: prompt,
  questions: {
    next_action: {
      type: 'choice',
      instructions:
        'Given the available tools and the conversation, what should the agent do next to answer the last customer message?',
      criteria: {
        ...tools,
        no_tool: 'No tool call needed — keep talking to the customer (greet, clarify, ask for missing info).',
      },
    },
  },
});

console.log(JSON.stringify(result.answers, null, 2));
console.log('usage:', result.usage);
