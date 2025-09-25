import { useState, useCallback } from "react";
import axios from "axios";

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

interface UseSearchBookReturn {
  books: string[];
  isLoading: boolean;
  error: string | null;
  fetch: (searchTerm?: string, page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  pagination: PaginationInfo | null;
  hasMore: boolean;
}

const useSearchBook = (): UseSearchBookReturn => {
  const [books, setBooks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>("");

  const fetchBooks = useCallback(
    async (
      searchTerm: string = "",
      page: number = 1,
      append: boolean = false
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");

        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        const response = await axios.get<ApiResponse>(
          `http://localhost:5000/api/books?${params.toString()}`
        );

        if (response.data.success) {
          if (append) {
            // Append new books to existing ones (for loadMore)
            setBooks((prevBooks) => [...prevBooks, ...response.data.data]);
          } else {
            // Replace books (for new search or initial fetch)
            setBooks(response.data.data);
          }
          setPagination(response.data.pagination);
          setCurrentSearchTerm(searchTerm);
        } else {
          setError("Failed to fetch books from API");
        }
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(
          "Unable to connect to the server. Make sure the backend is running on port 5000."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetch = useCallback(
    async (searchTerm: string = "", page: number = 1) => {
      await fetchBooks(searchTerm, page, false);
    },
    [fetchBooks]
  );

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage) {
      await fetchBooks(currentSearchTerm, pagination.nextPage!, true);
    }
  }, [fetchBooks, pagination, currentSearchTerm]);

  const hasMore = pagination?.hasNextPage ?? false;

  return {
    books,
    isLoading,
    error,
    fetch,
    loadMore,
    pagination,
    hasMore,
  };
};

export default useSearchBook;
