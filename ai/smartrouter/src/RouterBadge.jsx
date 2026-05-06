import { BUCKETS } from "./router.js";

export function RouterBadge({ bucket, classifierCost, status }) {
  const info = BUCKETS[bucket];
  if (!info) return null;

  return (
    <div className="router-badge" style={{ borderColor: info.color }}>
      <span className="rb-tag" style={{ background: info.color }}>
        {info.label}
      </span>
      <span className="rb-arrow">→</span>
      <code className="rb-model">{info.model}</code>
      <span className="rb-meta">
        classifier ${classifierCost.toFixed(6)}
        {status ? ` · ${status}` : ""}
      </span>
    </div>
  );
}
