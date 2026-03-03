import { useTaskFilter } from "../providers/TaskContext";
import "./FilterButtons.css";

function FilterButtons() {
  const { filter, setFilter } = useTaskFilter();
  const filters = ["all", "todo", "done"];
  return (
    <div className="filter-buttons">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`filter-button ${filter === f ? "active" : ""}`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons;