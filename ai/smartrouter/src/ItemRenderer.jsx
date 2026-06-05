import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ItemRenderer({ item }) {
  switch (item.type) {
    case "message":
      return <MessageItem message={item} />;
    case "reasoning":
      return <ReasoningItem reasoning={item} />;
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
      {role === "user" ? (
        <div className="text">{text}</div>
      ) : (
        <div className="text markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      )}
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
