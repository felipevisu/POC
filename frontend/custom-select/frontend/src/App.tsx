import React, { useEffect } from "react";
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
  const { books, isLoading, error, fetch, loadMore, pagination, hasMore } =
    useSearchBook();

  if (isLoading && books.length === 0) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          flexDirection="column"
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading books...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            <Typography variant="h6">Error</Typography>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <BookIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Book Collection
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Discover amazing books from our collection
          </Typography>
          <MultiAutocompleteSelectField fetchChoices={fetch} />
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 1,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={`${books.length} Books Loaded`}
              color="primary"
              variant="outlined"
            />
            {pagination && (
              <Chip
                label={`${pagination.totalBooks} Total Books`}
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Card elevation={3}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              📚 All Books
            </Typography>
            <List>
              {books.map((book, index) => (
                <ListItem
                  key={`${book}-${index}`}
                  divider={index < books.length - 1}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1" component="span">
                        {index + 1}. {book}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {/* Load More Button */}
            {hasMore && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={loadMore}
                  disabled={isLoading}
                  startIcon={
                    isLoading && books.length > 0 ? (
                      <CircularProgress size={20} />
                    ) : (
                      <AddIcon />
                    )
                  }
                  sx={{
                    minWidth: 200,
                    py: 1.5,
                  }}
                >
                  {isLoading && books.length > 0
                    ? "Loading..."
                    : "Load More Books"}
                </Button>
              </Box>
            )}

            {/* Show when all books are loaded */}
            {!hasMore && books.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  🎉 All books have been loaded! ({pagination?.totalBooks}{" "}
                  books)
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default App;
