import { BUCKETS, BASELINE } from "./router.js";

export function CostStats({ stats }) {
  const { total, baseline, classifier, byBucket, queries } = stats;
  const savings = baseline - total;
  const savedPct = baseline > 0 ? (savings / baseline) * 100 : 0;

  return (
    <div className="cost-stats">
      <div className="cs-row cs-headline">
        <div className="cs-cell">
          <div className="cs-label">Smart router</div>
          <div className="cs-val">${total.toFixed(5)}</div>
        </div>
        <div className="cs-cell">
          <div className="cs-label">vs {BASELINE.label}</div>
          <div className="cs-val">${baseline.toFixed(5)}</div>
        </div>
        <div className="cs-cell cs-savings">
          <div className="cs-label">Saved</div>
          <div className="cs-val">
            ${savings.toFixed(5)} ({savedPct.toFixed(1)}%)
          </div>
        </div>
        <div className="cs-cell">
          <div className="cs-label">Queries</div>
          <div className="cs-val">{queries}</div>
        </div>
      </div>

      <div className="cs-row cs-breakdown">
        <span className="cs-sub">Classifier overhead: ${classifier.toFixed(6)}</span>
        {Object.entries(byBucket).map(([key, v]) => {
          const info = BUCKETS[key];
          if (!info || v.count === 0) return null;
          return (
            <span
              key={key}
              className="cs-pill"
              style={{ background: info.color }}
              title={`${info.model} · ${v.count} call${v.count === 1 ? "" : "s"}`}
            >
              {info.label} ×{v.count} · ${v.cost.toFixed(5)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

