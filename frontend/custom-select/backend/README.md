# Books Backend API

Express.js backend server that provides a paginated API endpoint with search functionality for a collection of 101 books with unique IDs.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Or start the production server:

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

- `GET /` - Server information and API documentation
- `GET /api/books` - Returns paginated books with optional search

## Query Parameters

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of books per page (default: 20)
- `search` (optional): Search books by name (case-insensitive)

## Example Requests

```bash
# Get first 20 books
GET /api/books

# Get page 2 with 10 books per page
GET /api/books?page=2&limit=10

# Search for books containing "harry"
GET /api/books?search=harry

# Search with pagination
GET /api/books?page=1&limit=5&search=lord
```

## Example Response

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "To Kill a Mockingbird" },
    { "id": 2, "name": "1984" },
    { "id": 3, "name": "Pride and Prejudice" }
    // ... up to 20 more books
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 6,
    "totalBooks": 101,
    "booksPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "search": null
}
```

## Dependencies

- express: Web framework
- cors: Cross-origin resource sharing
- nodemon: Development server with auto-reload
