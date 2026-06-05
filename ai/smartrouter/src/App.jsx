import { useState } from "react";
import { OpenRouter } from "@openrouter/agent";
import { ItemRenderer } from "./ItemRenderer.jsx";
import { RouterBadge } from "./RouterBadge.jsx";
import { CostStats } from "./CostStats.jsx";
import {
  BUCKETS,
  classifyPrompt,
  bucketCost,
  baselineCost,
  emptyStats,
} from "./router.js";

const client = new OpenRouter({
  serverURL: `${window.location.origin}/api/openrouter`,
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY ?? "proxy",
});

function App() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState(new Map());
  const [pending, setPending] = useState(false);
  const [stats, setStats] = useState(emptyStats);

  function pushItem(item) {
    setItems((prev) => new Map(prev).set(item.id, item));
  }

  async function handleSubmit(text) {
    if (!text.trim() || pending) return;
    setPending(true);
    setInput("");

    const userId = `user-${Date.now()}`;
    pushItem({
      id: userId,
      type: "message",
      role: "user",
      content: [{ type: "output_text", text }],
    });

    const routeId = `route-${Date.now()}`;
    pushItem({
      id: routeId,
      type: "router",
      status: "classifying…",
    });

    try {
      const { bucket, cost: classifierCost } = await classifyPrompt(
        client,
        text,
      );
      const info = BUCKETS[bucket];

      pushItem({
        id: routeId,
        type: "router",
        bucket,
        classifierCost,
        status: `routed to ${info.model}`,
      });

      const result = client.callModel({
        model: info.model,
        input: text,
      });

      const assistantId = `assistant-${Date.now()}`;
      let buffer = "";
      pushItem({
        id: assistantId,
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: "" }],
      });

      for await (const delta of result.getTextStream()) {
        buffer += delta;
        pushItem({
          id: assistantId,
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: buffer }],
        });
      }

      const response = await result.getResponse();
      const usage = response.usage ?? {};
      const answerCost = bucketCost(usage, info);
      const baseCost = baselineCost(usage);
      const totalCost = answerCost + classifierCost;

      setStats((prev) => {
        const bb = { ...prev.byBucket };
        bb[bucket] = {
          count: bb[bucket].count + 1,
          cost: bb[bucket].cost + answerCost,
        };
        return {
          total: prev.total + totalCost,
          baseline: prev.baseline + baseCost,
          classifier: prev.classifier + classifierCost,
          queries: prev.queries + 1,
          byBucket: bb,
        };
      });

      pushItem({
        id: routeId,
        type: "router",
        bucket,
        classifierCost,
        status: `done · in ${usage.inputTokens ?? 0} / out ${
          usage.outputTokens ?? 0
        } tok · $${answerCost.toFixed(6)} (baseline $${baseCost.toFixed(6)})`,
      });
    } catch (err) {
      pushItem({
        id: `err-${Date.now()}`,
        type: "error",
        message: err?.message ?? String(err),
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="chat">
      <h1>Smart Router</h1>
      <CostStats stats={stats} />
      <div className="messages">
        {[...items.values()].map((item) =>
          item.type === "router" ? (
            <RouterBadge
              key={item.id}
              bucket={item.bucket}
              classifierCost={item.classifierCost ?? 0}
              status={item.status}
            />
          ) : (
            <ItemRenderer key={item.id} item={item} />
          ),
        )}
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
          placeholder="Ask anything — router picks the right model…"
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
