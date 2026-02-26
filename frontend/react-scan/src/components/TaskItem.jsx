import "./TaskItem.css";

function TaskItem({ task, onToggle, onDelete }) {
  const priorityColor = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
  
  return (
    <div className={`task-item ${task.done ? "done" : ""}`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`task-checkbox task-checkbox--${task.priority} ${task.done ? "checked" : ""}`}
      >
        {task.done && <span className="task-checkbox-checkmark">✓</span>}
      </button>

      <span className={`task-title ${task.done ? "done" : ""}`}>
        {task.title}
      </span>

      <span className={`task-priority task-priority--${task.priority}`}>
        {task.priority}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        className="task-delete-button"
      >
        ×
      </button>
    </div>
  );
}

export default TaskItem;