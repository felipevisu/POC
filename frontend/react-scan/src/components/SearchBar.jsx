import { useContext } from "react";
import { AppContext } from "../AppContext";
import "./SearchBar.css";

function SearchBar() {
  const { search, setSearch } = useContext(AppContext);
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