import { useCallback, useMemo, useState } from "react";
import { TaskDataContext, TaskFilterContext } from "./TaskContext";

const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Fix the infinite loop", done: false, priority: "high" },
    { id: 2, title: "Stop re-rendering everything", done: false, priority: "medium" },
    { id: 3, title: "Learn useMemo", done: true, priority: "low" },
    { id: 4, title: "Delete this file", done: false, priority: "high" },
    { id: 5, title: "Run React Scan", done: false, priority: "medium" },
  ]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const addTask = useCallback((title) => {
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title, done: false, priority: "medium" },
    ]);
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const deleteTask = useCallback((id) => setTasks((prev) => prev.filter((t) => t.id !== id)), []);

  const dataValue = useMemo(
    () => ({ tasks, addTask, toggleTask, deleteTask }),
    [tasks, addTask, toggleTask, deleteTask]
  );

  const filterValue = useMemo(
    () => ({ search, setSearch, filter, setFilter }),
    [search, filter]
  );

  return (
    <TaskDataContext.Provider value={dataValue}>
      <TaskFilterContext.Provider value={filterValue}>
        {children}
      </TaskFilterContext.Provider>
    </TaskDataContext.Provider>
  );
};

export default TaskProvider;
