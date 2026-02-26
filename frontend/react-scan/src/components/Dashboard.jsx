import AddTaskForm from "./AddTaskForm";
import FilterButtons from "./FilterButtons";
import SearchBar from "./SearchBar";
import StatsBar from "./StatsBar";
import NotificationBadge from "./NotificationBadge";
import Clock from "./Clock";
import TaskList from "./TaskList";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-container">

        <div className="dashboard-header">
          <div className="dashboard-notifications">
            <div className="notification-wrapper">
              <div className="notification-box">
                Notifications
              </div>
              <NotificationBadge />
            </div>
            <Clock />
          </div>
        </div>

        <div className="dashboard-title-section">
          <h1 className="dashboard-title">
            Disaster Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Every anti-pattern in one place. Open React Scan and watch the chaos.
          </p>
        </div>

        <div className="dashboard-stats">
          <StatsBar />
        </div>

        <div className="dashboard-card">
          <div className="dashboard-filters">
            <SearchBar />
            <FilterButtons />
          </div>

          <TaskList />

          <div className="dashboard-add-task">
            <AddTaskForm />
          </div>
        </div>

        <div className="dashboard-warning">
          <p className="warning-title">
            🐛 Anti-Patterns Inside
          </p>
          {[
            "Giant Context → every component re-renders every 1.5s",
            "Inline object as Context value → new reference every render",
            "50k iteration loop inside render (no useMemo)",
            "Inline arrow functions passed as props to TaskItem",
            "No React.memo on any component",
            "Clock + NotificationBadge re-render the entire tree",
          ].map((p, i) => (
            <p key={i} className="warning-item">
              {p}
            </p>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;