import { observer } from "mobx-react-lite";
import { todoStore } from "../stores/TodoStore.js";

export const Stats = observer(() => {
  return (
    <div>
      <h2>Stats</h2>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{todoStore.totalCount}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat">
          <span className="stat-value">{todoStore.activeCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat">
          <span className="stat-value">{todoStore.completedCount}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>
    </div>
  );
});
