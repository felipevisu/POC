import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Book as BookIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBooks: number;
  booksPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface ApiResponse {
  success: boolean;
  data: string[];
  pagination: PaginationInfo;
  search: string | null;
}

const App: React.FC = () => {
  const [books, setBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchBooks = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await axios.get<ApiResponse>(
        `http://localhost:5000/api/books?page=${page}&limit=20`
      );
      
      if (response.data.success) {
        if (append) {
          // Append new books to existing ones
          setBooks(prevBooks => [...prevBooks, ...response.data.data]);
        } else {
          // Replace books (initial load)
          setBooks(response.data.data);
        }
        setPagination(response.data.pagination);
        setCurrentPage(response.data.pagination.currentPage);
      } else {
        setError('Failed to fetch books from API');
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Unable to connect to the server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      fetchBooks(pagination.nextPage!, true);
    }
  };

  useEffect(() => {
    fetchBooks(1, false);
  }, []);

  if (loading) {
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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <BookIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Book Collection
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Discover amazing books from our collection
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                    '&:hover': {
                      backgroundColor: 'action.hover',
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
            {pagination?.hasNextPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  startIcon={loadingMore ? <CircularProgress size={20} /> : <AddIcon />}
                  sx={{
                    minWidth: 200,
                    py: 1.5,
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load More Books'}
                </Button>
              </Box>
            )}

            {/* Show when all books are loaded */}
            {pagination && !pagination.hasNextPage && books.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  🎉 All books have been loaded! ({pagination.totalBooks} books)
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