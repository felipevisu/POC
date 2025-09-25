import React, { useState } from "react";
import MultiAutocompleteSelectField from "./components/MultiAutocompleteSelectField/MultiAutocompleteSelectField";
import useSearchBook from "./hooks/useSearchBook";
import { Box, Container } from "@mui/material";

const App: React.FC = () => {
  const { books = [], isLoading, fetch, loadMore } = useSearchBook();

  const [selectedBooks, setSelectedBooks] = useState<
    { label: string; value: number | string }[]
  >([]);

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <MultiAutocompleteSelectField
          fetchChoices={fetch}
          loadMore={loadMore}
          loading={isLoading}
          choices={books.map((b) => ({ value: b.id, label: b.name }))}
          value={selectedBooks}
          onChange={setSelectedBooks}
        />
      </Box>
    </Container>
  );
};

export default App;
