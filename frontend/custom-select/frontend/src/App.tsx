import React, { useState } from "react";
import MultiAutocompleteSelectField from "./components/MultiAutocompleteSelectField/MultiAutocompleteSelectField";
import useSearchBook from "./hooks/useSearchBook";
import "./App.css";

const App: React.FC = () => {
  const { books = [], isLoading, fetch, loadMore } = useSearchBook();

  const [selectedBooks, setSelectedBooks] = useState<
    { label: string; value: number | string }[]
  >([]);

  return (
    <div className="app-container">
      <div className="app-content">
        <MultiAutocompleteSelectField
          fetchChoices={fetch}
          loadMore={loadMore}
          loading={isLoading}
          choices={books.map((b) => ({ value: b.id, label: b.name }))}
          value={selectedBooks}
          onChange={setSelectedBooks}
        />
      </div>
    </div>
  );
};

export default App;
