import React from "react";
import MultiAutocompleteSelectField from "./components/MultiAutocompleteSelectField/MultiAutocompleteSelectField";
import useSearchBook from "./hooks/useSearchBook";
import { Box, Container } from "@mui/material";

const App: React.FC = () => {
  const {
    books = [],
    isLoading,

    fetch,
    loadMore,
  } = useSearchBook();

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <MultiAutocompleteSelectField
          fetchChoices={fetch}
          loadMore={loadMore}
          loading={isLoading}
          choices={books.map((b) => ({ value: b.id, label: b.name }))}
        />
      </Box>
    </Container>
  );
};

export default App;
