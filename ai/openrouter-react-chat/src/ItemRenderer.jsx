import { GithubReposList } from "./GithubReposList.jsx";

function isGithubReposPayload(value) {
  return (
    value &&
    typeof value === "object" &&
    Array.isArray(value.repos) &&
    typeof value.username === "string"
  );
}

export function ItemRenderer({ item }) {
  switch (item.type) {
    case "message":
      return <MessageItem message={item} />;
    case "function_call":
      return <ToolCallItem call={item} />;
    case "reasoning":
      return <ReasoningItem reasoning={item} />;
    case "function_call_output":
      return <ToolOutputItem output={item} />;
    case "error":
      return <div className="item error">Error: {item.message}</div>;
    default:
      return null;
  }
}

function MessageItem({ message }) {
  const role = message.role ?? "assistant";
  const text = (message.content ?? [])
    .map((c) => {
      if (c.type === "output_text") return c.text;
      if (c.type === "refusal") return `[refusal] ${c.refusal ?? ""}`;
      return "";
    })
    .join("");

  return (
    <div className={`item message ${role}`}>
      <div className="role">{role}</div>
      <div className="text">{text}</div>
    </div>
  );
}

function ToolCallItem({ call }) {
  return (
    <div className="item tool-call">
      <div className="role">tool · {call.name}</div>
      <pre className="args">{call.arguments || ""}</pre>
      {call.status && <div className="status">{call.status}</div>}
    </div>
  );
}

function ToolOutputItem({ output }) {
  const raw =
    typeof output.output === "string"
      ? output.output
      : JSON.stringify(output.output);

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // not JSON
  }

  if (isGithubReposPayload(parsed)) {
    return <GithubReposList data={parsed} />;
  }

  const pretty = parsed ? JSON.stringify(parsed, null, 2) : raw;

  return (
    <div className="item tool-output">
      <div className="role">tool result</div>
      <pre className="args">{pretty}</pre>
    </div>
  );
}

function ReasoningItem({ reasoning }) {
  const summary = (reasoning.summary ?? []).map((s) => s.text).join("\n");
  const detail = (reasoning.content ?? []).map((c) => c.text).join("\n");
  const text = detail || summary;
  if (!text) return null;
  return (
    <div className="item reasoning">
      <div className="role">reasoning</div>
      <div className="text">{text}</div>
    </div>
  );
}
