import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PiiForm } from "./PiiForm.jsx";
import { ApplicationSummary } from "./ApplicationSummary.jsx";

export function ItemRenderer({ item, onPiiSubmit }) {
  switch (item.type) {
    case "message":
      return <MessageItem message={item} />;
    case "pii_form":
      return (
        <PiiForm
          fields={item.fields}
          note={item.note}
          submitted={item.submitted}
          values={item.values}
          onSubmit={(values) => onPiiSubmit(item.id, values)}
        />
      );
    case "summary":
      return (
        <ApplicationSummary
          position={item.position}
          summary={item.summary}
          highlights={item.highlights}
          profile={item.profile}
        />
      );
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
      <div className="role">{role === "user" ? "you" : "interviewer"}</div>
      {role === "user" ? (
        <div className="text">{message.text}</div>
      ) : (
        <div className="text markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
