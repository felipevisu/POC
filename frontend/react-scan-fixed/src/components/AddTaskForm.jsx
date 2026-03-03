import { useState } from "react";
import { useTaskData } from "../providers/TaskContext";
import "./AddTaskForm.css";

function AddTaskForm() {
  // ANTI-PATTERN #5: Local state that triggers re-renders of siblings via context
  const [input, setInput] = useState("");
  const { addTask } = useTaskData();

  const handleAdd = () => {
    if (input.trim()) {
      addTask(input.trim());
      setInput("");
    }
  };

  return (
    <div className="add-task-form">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Add a new task... (press Enter)"
        className="add-task-input"
      />
      <button
        onClick={handleAdd}
        className="add-task-button"
      >
        Add
      </button>
    </div>
  );
}

export default AddTaskForm;