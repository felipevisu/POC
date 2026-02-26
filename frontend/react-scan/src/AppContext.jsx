import { createContext, useContext } from "react";

export const AppContext = createContext();

export function useFilteredTasks() {
  const { tasks, search, filter } = useContext(AppContext);
  
  // This runs on EVERY render, even when nothing changed
  const result = tasks
    .filter((t) => {
      if (filter === "done") return t.done;
      if (filter === "todo") return !t.done;
      return true;
    })
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  // Fake "expensive" calculation
  let sum = 0;
  // eslint-disable-next-line no-unused-vars
  for (let i = 0; i < 50000; i++) sum += Math.sqrt(i);

  return result;
}