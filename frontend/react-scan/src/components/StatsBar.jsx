import { useContext } from "react";
import { AppContext } from "../AppContext";
import "./StatsBar.css";

// Subscribes to context just for stats — re-renders every 1.5s
function StatsBar() {
  const { tasks } = useContext(AppContext);
  
  // Recalculated every render without useMemo
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const high = tasks.filter((t) => t.priority === "high" && !t.done).length;

  return (
    <div className="stats-bar">
      {[
        { label: "Total", value: total, colorClass: "total" },
        { label: "Done", value: done, colorClass: "done" },
        { label: "Urgent", value: high, colorClass: "urgent" },
      ].map((s) => (
        <div key={s.label} className="stat-card">
          <div className={`stat-value stat-value--${s.colorClass}`}>{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;