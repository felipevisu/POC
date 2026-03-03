import { createContext, useContext, useMemo } from "react";

export const TaskDataContext = createContext();
export const TaskFilterContext = createContext();

export function useTaskData() {
  return useContext(TaskDataContext);
}

export function useTaskFilter() {
  return useContext(TaskFilterContext);
}

export function useStats() {
  const { tasks } = useTaskData();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const high = tasks.filter((t) => t.priority === "high" && !t.done).length;

    return { total, done, high };
  }, [tasks]);
  return stats;
}

export function useFilteredTasks() {
  const { tasks } = useTaskData();
  const { search, filter } = useTaskFilter();

  const result = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter === "done") return t.done;
        if (filter === "todo") return !t.done;
        return true;
      })
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search, filter]);

  return result;
}
