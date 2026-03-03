import { useTaskFilter } from "../providers/TaskContext";
import "./SearchBar.css";

function SearchBar() {
  const { search, setSearch } = useTaskFilter();
  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search tasks..."
      className="search-bar"
    />
  );
}

export default SearchBar;