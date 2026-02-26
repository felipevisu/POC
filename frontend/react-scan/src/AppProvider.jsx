import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";

const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Fix the infinite loop", done: false, priority: "high" },
    { id: 2, title: "Stop re-rendering everything", done: false, priority: "medium" },
    { id: 3, title: "Learn useMemo", done: true, priority: "low" },
    { id: 4, title: "Delete this file", done: false, priority: "high" },
    { id: 5, title: "Run React Scan", done: false, priority: "medium" },
  ]);
  const [user, setUser] = useState({ name: "Dev", theme: "dark" });
  const [notifications, setNotifications] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ANTI-PATTERN #1: Timer that causes re-renders on EVERYTHING every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      setNotifications((n) => n + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const addTask = (title) => {
    // ANTI-PATTERN #2: Creates new array every call (fine here, bad if memoized wrong below)
    setTasks([
      ...tasks,
      { id: Date.now(), title, done: false, priority: "medium" },
    ]);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  return (
    <AppContext.Provider
      // ANTI-PATTERN #3: New object literal every render = ALL consumers re-render
      value={{ tasks, user, notifications, search, setSearch, filter, setFilter, addTask, toggleTask, deleteTask, lastUpdated, setUser }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;