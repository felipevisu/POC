import { useState } from "react";
import Anthropic from "@anthropic-ai/sdk";
import { toolSchemas, toolsByName } from "./tools.js";
import { ItemRenderer } from "./ItemRenderer.jsx";

const CUSTOM_RENDER_TOOLS = new Set(["get_weather"]);

const client = new Anthropic({
  baseURL: `${window.location.origin}/api/anthropic`,
  apiKey: "proxy",
  dangerouslyAllowBrowser: true,
});

const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 4096;

function App() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState([]);
  const [pending, setPending] = useState(false);

  function appendItem(item) {
    const id = item.id ?? `${item.type}-${Date.now()}-${Math.random()}`;
    setItems((prev) => [...prev, { ...item, id }]);
  }

  async function handleSubmit(text) {
    if (!text.trim() || pending) return;
    setPending(true);
    setInput("");

    appendItem({ type: "message", role: "user", text });

    const messages = [{ role: "user", content: text }];
    const schemas = toolSchemas();

    try {
      let suppressFinalText = false;

      while (true) {
        const response = await client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          tools: schemas,
          messages,
        });

        const assistantText = response.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("");

        const toolUses = response.content.filter((b) => b.type === "tool_use");

        if (assistantText && !toolUses.length && !suppressFinalText) {
          appendItem({ type: "message", role: "assistant", text: assistantText });
        }

        if (response.stop_reason !== "tool_use" || !toolUses.length) {
          break;
        }

        if (toolUses.some((t) => CUSTOM_RENDER_TOOLS.has(t.name))) {
          suppressFinalText = true;
        }

        messages.push({ role: "assistant", content: response.content });

        const toolResults = [];
        for (const call of toolUses) {
          appendItem({
            id: call.id,
            type: "tool_use",
            name: call.name,
            input: call.input,
          });

          const tool = toolsByName[call.name];
          let output;
          let isError = false;
          try {
            output = tool
              ? await tool.execute(call.input ?? {})
              : { error: `Unknown tool: ${call.name}` };
          } catch (err) {
            isError = true;
            output = { error: err?.message ?? String(err) };
          }

          appendItem({
            id: `${call.id}-result`,
            type: "tool_result",
            output,
          });

          toolResults.push({
            type: "tool_result",
            tool_use_id: call.id,
            content: JSON.stringify(output),
            is_error: isError,
          });

        }

        messages.push({ role: "user", content: toolResults });
      }
    } catch (err) {
      appendItem({
        type: "error",
        message: err?.message ?? String(err),
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="chat">
      <h1>Weather Chat</h1>
      <div className="messages">
        {items.map((item) => (
          <ItemRenderer key={item.id} item={item} />
        ))}
        {pending && <div className="status">Thinking…</div>}
      </div>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about weather… e.g. weekend in Lisbon"
          disabled={pending}
          autoFocus
        />
        <button type="submit" disabled={pending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
