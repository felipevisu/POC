import { useStats } from "../providers/TaskContext";
import "./StatsBar.css";

function StatsBar() {
  const { total, done, high } = useStats();

  const stats = [
    { label: "Total", value: total, colorClass: "total" },
    { label: "Done", value: done, colorClass: "done" },
    { label: "Urgent", value: high, colorClass: "urgent" },
  ]

  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div key={s.label} className="stat-card">
          <div className={`stat-value stat-value--${s.colorClass}`}>{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;