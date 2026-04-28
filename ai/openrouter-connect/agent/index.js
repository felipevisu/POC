import { callModel, tool } from "@openrouter/agent";
import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";

const client = new OpenRouter({ apiKey: process.env.API_KEY });

const weatherTool = tool({
  name: "get_weather",
  description: "Get the current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),
  execute: async ({ location }) => {
    return { temperature: 72, condition: "sunny", location };
  },
});

const result = callModel(client, {
  model: "anthropic/claude-sonnet-4",
  input: "What is the weather in Guaxupé?",
  tools: [weatherTool],
});

const text = await result.getText();
console.log(text);
