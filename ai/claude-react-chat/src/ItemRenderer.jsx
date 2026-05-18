import { WeatherCard } from "./WeatherCard.jsx";

function isWeatherPayload(value) {
  return (
    value &&
    typeof value === "object" &&
    value.kind === "weather" &&
    value.location &&
    value.current &&
    Array.isArray(value.daily)
  );
}

export function ItemRenderer({ item }) {
  switch (item.type) {
    case "message":
      return <MessageItem message={item} />;
    case "tool_use":
      return <ToolCallItem call={item} />;
    case "tool_result":
      return <ToolOutputItem output={item} />;
    case "error":
      return <div className="item error">Error: {item.message}</div>;
    default:
      return null;
  }
}

function MessageItem({ message }) {
  const role = message.role ?? "assistant";
  return (
    <div className={`item message ${role}`}>
      <div className="role">{role}</div>
      <div className="text">{message.text}</div>
    </div>
  );
}

function ToolCallItem({ call }) {
  return (
    <div className="item tool-call">
      <div className="role">tool · {call.name}</div>
      <pre className="args">{JSON.stringify(call.input, null, 2)}</pre>
    </div>
  );
}

function ToolOutputItem({ output }) {
  const payload = output.output;
  const parsed = typeof payload === "string" ? safeParse(payload) : payload;

  if (isWeatherPayload(parsed)) {
    return <WeatherCard data={parsed} />;
  }
  if (parsed && parsed.ok === false) {
    return <div className="item error">{parsed.error ?? "Tool error"}</div>;
  }

  const pretty =
    parsed != null
      ? JSON.stringify(parsed, null, 2)
      : typeof payload === "string"
        ? payload
        : JSON.stringify(payload);

  return (
    <div className="item tool-output">
      <div className="role">tool result</div>
      <pre className="args">{pretty}</pre>
    </div>
  );
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
