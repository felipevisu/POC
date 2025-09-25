# useSearchBook Hook

A custom React hook for managing book search functionality with pagination support.

## Features

- **Lazy Loading**: No initial fetch - consumer must call `fetch()` manually
- **Search Support**: Built-in search functionality with query parameter
- **Pagination**: Load more functionality with automatic page management
- **Error Handling**: Comprehensive error state management
- **Loading States**: Separate loading states for initial load and load more

## Usage

```tsx
import useSearchBook from "./hooks/useSearchBook";

const MyComponent = () => {
  const { books, isLoading, error, fetch, loadMore, pagination, hasMore } =
    useSearchBook();

  // Initial fetch
  useEffect(() => {
    fetch(); // Load first page without search
  }, [fetch]);

  // Search with term
  const handleSearch = (searchTerm: string) => {
    fetch(searchTerm); // Load first page with search term
  };

  // Load more books
  const handleLoadMore = () => {
    loadMore(); // Append next page to existing books
  };

  return (
    <div>
      {books.map((book) => (
        <div key={book}>{book}</div>
      ))}
      {hasMore && <button onClick={handleLoadMore}>Load More</button>}
    </div>
  );
};
```

## Return Values

- `books: string[]` - Array of book titles
- `isLoading: boolean` - Loading state for any fetch operation
- `error: string | null` - Error message if fetch fails
- `fetch: (searchTerm?: string, page?: number) => Promise<void>` - Fetch books (replaces current list)
- `loadMore: () => Promise<void>` - Load next page (appends to current list)
- `pagination: PaginationInfo | null` - Pagination metadata from API
- `hasMore: boolean` - Whether more books are available to load

## API Integration

The hook integrates with the backend API endpoint:

- `GET /api/books?page=X&limit=20&search=TERM`
- Returns paginated results with metadata
- Supports search functionality

## State Management

- **Initial State**: Empty books array, no loading
- **Fetch**: Replaces books array, resets pagination
- **Load More**: Appends to books array, updates pagination
- **Search**: Treats as new fetch, replaces books array
