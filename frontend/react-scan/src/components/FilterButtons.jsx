import { useContext } from "react";
import { AppContext } from "../AppContext";
import "./FilterButtons.css";

function FilterButtons() {
  const { filter, setFilter } = useContext(AppContext);
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