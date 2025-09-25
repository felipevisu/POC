import React from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from "@mui/material";
import { Book as BookIcon, Add as AddIcon } from "@mui/icons-material";
import MultiAutocompleteSelectField from "./components/MultiAutocompleteSelectField/MultiAutocompleteSelectField";
import useSearchBook from "./hooks/useSearchBook";

const App: React.FC = () => {
  const {
    books = [],
    isLoading,
    error,
    fetch,
    loadMore,
    pagination,
    hasMore,
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
