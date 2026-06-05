import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
  apiKey: process.env.API_KEY,
});

const completion = await client.chat.send({
  chatRequest: {
    model: "openai/gpt-5.2",
    messages: [
      {
        role: "user",
        content: "What is the meaning of life?",
      },
    ],
  },
});

console.log(completion.choices[0].message.content);
