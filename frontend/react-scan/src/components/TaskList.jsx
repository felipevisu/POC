import { useContext } from "react";
import { AppContext, useFilteredTasks } from "../AppContext";
import TaskItem from "./TaskItem";
import "./TaskList.css";

function TaskList() {
  const { toggleTask, deleteTask } = useContext(AppContext);
  const filteredTasks = useFilteredTasks();

  return (
    <div className="task-list">
      {filteredTasks.length === 0 ? (
        <div className="task-list-empty">
          No tasks found. Impressive! (or your filter is wrong)
        </div>
      ) : (
        filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => toggleTask(task.id)}
            onDelete={() => deleteTask(task.id)}
          />
        ))
      )}
    </div>
  );
}

export default TaskList;