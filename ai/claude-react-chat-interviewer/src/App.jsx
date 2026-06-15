import { useEffect, useRef, useState } from "react";
import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT,
  toolSchemas,
  toolsByName,
  INTERACTIVE_TOOLS,
} from "./interview.js";
import { ItemRenderer } from "./ItemRenderer.jsx";

const client = new Anthropic({
  baseURL: `${window.location.origin}/api/anthropic`,
  apiKey: "proxy",
  dangerouslyAllowBrowser: true,
});

const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 2048;

function App() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState([]);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  // Full Anthropic message history (no PII ever lands here).
  const messagesRef = useRef([]);
  // PII the applicant typed. Stays client-side, never sent to the model.
  const profileRef = useRef({});
  // Tool-use turn currently waiting on one or more PII forms.
  const pendingTurnRef = useRef(null);
  const startedRef = useRef(false);

  function appendItem(item) {
    const id = item.id ?? `${item.type}-${Date.now()}-${Math.random()}`;
    setItems((prev) => [...prev, { ...item, id }]);
  }

  // Drives the tool-use loop until Claude stops or an interactive tool
  // suspends it pending user form input.
  async function runLoop() {
    setPending(true);
    try {
      while (true) {
        const response = await client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          tools: toolSchemas(),
          messages: messagesRef.current,
        });

        const assistantText = response.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("");
        if (assistantText) {
          appendItem({ type: "message", role: "assistant", text: assistantText });
        }

        messagesRef.current.push({ role: "assistant", content: response.content });

        const toolUses = response.content.filter((b) => b.type === "tool_use");
        if (response.stop_reason !== "tool_use" || !toolUses.length) break;

        const results = new Array(toolUses.length).fill(null);
        let waiting = false;

        for (let i = 0; i < toolUses.length; i++) {
          const call = toolUses[i];

          if (INTERACTIVE_TOOLS.has(call.name)) {
            // Suspend: render a form. Result is filled by handlePiiSubmit.
            waiting = true;
            appendItem({
              type: "pii_form",
              id: call.id,
              fields: call.input?.fields ?? [],
              note: call.input?.note,
            });
            continue;
          }

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

          if (output?.kind === "application_submitted") {
            setDone(true);
            appendItem({
              type: "summary",
              position: call.input?.position,
              summary: call.input?.summary,
              highlights: call.input?.highlights,
              profile: { ...profileRef.current },
            });
          }

          results[i] = {
            type: "tool_result",
            tool_use_id: call.id,
            content: JSON.stringify(output),
            is_error: isError,
          };
        }

        if (waiting) {
          // Park the turn; handlePiiSubmit resumes once every form is in.
          pendingTurnRef.current = { toolUses, results };
          setPending(false);
          return;
        }

        messagesRef.current.push({ role: "user", content: results });
      }
    } catch (err) {
      appendItem({ type: "error", message: err?.message ?? String(err) });
    } finally {
      setPending(false);
    }
  }

  // Applicant submitted a PII form: keep values local, tell the model only
  // which fields were filled, and resume the loop when all forms are done.
  function handlePiiSubmit(toolUseId, values) {
    profileRef.current = { ...profileRef.current, ...values };
    setItems((prev) =>
      prev.map((it) =>
        it.id === toolUseId ? { ...it, submitted: true, values } : it,
      ),
    );

    const turn = pendingTurnRef.current;
    if (!turn) return;
    const idx = turn.toolUses.findIndex((t) => t.id === toolUseId);
    if (idx === -1) return;

    turn.results[idx] = {
      type: "tool_result",
      tool_use_id: toolUseId,
      content: JSON.stringify({
        ok: true,
        collected: Object.keys(values),
        note: "Stored on the applicant's device. Values not shared with the model.",
      }),
    };

    if (turn.results.every(Boolean)) {
      messagesRef.current.push({ role: "user", content: turn.results });
      pendingTurnRef.current = null;
      runLoop();
    }
  }

  async function handleSubmit(text) {
    if (!text.trim() || pending || done) return;
    setInput("");
    appendItem({ type: "message", role: "user", text });
    messagesRef.current.push({ role: "user", content: text });
    runLoop();
  }

  // Kick off the interview on mount (guard against StrictMode double-run).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    messagesRef.current.push({
      role: "user",
      content: "Hi, I'd like to apply. Please start the interview.",
    });
    runLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="chat">
      <div className="chat-header">
        <h1>Job Screening</h1>
      </div>
      <div className="messages">
        {items.map((item) => (
          <ItemRenderer
            key={item.id}
            item={item}
            onPiiSubmit={handlePiiSubmit}
          />
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
          placeholder={
            done ? "Interview complete" : "Type your answer…"
          }
          disabled={pending || done}
        />
        <button type="submit" disabled={pending || done || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
