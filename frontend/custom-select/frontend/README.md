# Books Frontend

React + TypeScript + Vite frontend application that displays a list of books fetched from the backend API using Material-UI components.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

The application will run on `http://localhost:3000`

## Features

- **Pagination with Load More**: Loads 20 books at a time with a "Load More" button
- **Progressive Loading**: Previously loaded books remain on screen while new ones are appended
- **Smart UI States**: Different loading states for initial load vs. loading more books
- **Book Counter**: Shows both loaded books count and total available books
- **Beautiful Interface**: Material-UI components with hover effects and smooth interactions
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Works seamlessly on all device sizes

## Technologies

- React 18
- TypeScript
- Vite (build tool)
- Material-UI (MUI)
- Axios (HTTP client)
- Emotion (styling)

## Prerequisites

Make sure the backend server is running on `http://localhost:5000` before starting the frontend application.