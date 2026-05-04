import { useState } from "react";
import { OpenRouter, hasToolCall } from "@openrouter/agent";
import { listGithubReposTool } from "./tools.js";
import { ItemRenderer } from "./ItemRenderer.jsx";

const client = new OpenRouter({
  serverURL: `${window.location.origin}/api/openrouter`,
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY ?? "proxy",
});

const tools = [listGithubReposTool];

function App() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState(new Map());
  const [pending, setPending] = useState(false);

  async function handleSubmit(text) {
    if (!text.trim() || pending) return;
    setPending(true);
    setInput("");

    const userId = `user-${Date.now()}`;
    setItems((prev) =>
      new Map(prev).set(userId, {
        id: userId,
        type: "message",
        role: "user",
        content: [{ type: "output_text", text }],
      }),
    );

    try {
      const result = client.callModel({
        model: "anthropic/claude-sonnet-4",
        input: text,
        tools,
        stopWhen: hasToolCall("list_github_repos"),
      });

      const cycleKeys = new Set();
      let suppressAssistantMessages = false;

      for await (const item of result.getItemsStream()) {
        if (
          item.type === "function_call" &&
          item.name === "list_github_repos"
        ) {
          suppressAssistantMessages = true;
          setItems((prev) => {
            const next = new Map(prev);
            for (const k of cycleKeys) {
              const v = next.get(k);
              if (v && v.type === "message" && v.role !== "user") next.delete(k);
            }
            return next;
          });
        }

        if (
          suppressAssistantMessages &&
          item.type === "message" &&
          item.role !== "user"
        ) {
          continue;
        }

        const key =
          item.id ??
          (item.callId
            ? `${item.callId}-${item.type}`
            : `${item.type}-${Date.now()}-${Math.random()}`);
        cycleKeys.add(key);
        setItems((prev) => new Map(prev).set(key, item));
      }
    } catch (err) {
      const errId = `err-${Date.now()}`;
      setItems((prev) =>
        new Map(prev).set(errId, {
          id: errId,
          type: "error",
          message: err?.message ?? String(err),
        }),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="chat">
      <h1>OpenRouter Chat</h1>
      <div className="messages">
        {[...items.values()].map((item) => (
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
          placeholder="Send a message…"
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
