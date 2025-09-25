const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data: 100 book names
const books = [
  "To Kill a Mockingbird",
  "1984",
  "Pride and Prejudice",
  "The Great Gatsby",
  "One Hundred Years of Solitude",
  "In Cold Blood",
  "Wide Sargasso Sea",
  "Brave New World",
  "I Capture The Castle",
  "Jane Eyre",
  "Crime and Punishment",
  "The Secret History",
  "The Lord of the Rings",
  "The Handmaid's Tale",
  "The Time Traveler's Wife",
  "The Book Thief",
  "Wuthering Heights",
  "The Kite Runner",
  "Life of Pi",
  "The Chronicles of Narnia",
  "Harry Potter and the Sorcerer's Stone",
  "The Catcher in the Rye",
  "Of Mice and Men",
  "The Grapes of Wrath",
  "Fahrenheit 451",
  "Animal Farm",
  "The Hobbit",
  "Dune",
  "Foundation",
  "The Martian",
  "Ender's Game",
  "The Hitchhiker's Guide to the Galaxy",
  "Neuromancer",
  "The Left Hand of Darkness",
  "Hyperion",
  "The Name of the Wind",
  "A Game of Thrones",
  "The Way of Kings",
  "Mistborn: The Final Empire",
  "The Eye of the World",
  "The Fellowship of the Ring",
  "The Two Towers",
  "The Return of the King",
  "The Silmarillion",
  "The Stand",
  "It",
  "The Shining",
  "Carrie",
  "Pet Sematary",
  "Salem's Lot",
  "The Dark Tower: The Gunslinger",
  "Dracula",
  "Frankenstein",
  "The Strange Case of Dr. Jekyll and Mr. Hyde",
  "The Picture of Dorian Gray",
  "Heart of Darkness",
  "The Sun Also Rises",
  "For Whom the Bell Tolls",
  "A Farewell to Arms",
  "The Old Man and the Sea",
  "The Sound and the Fury",
  "As I Lay Dying",
  "Light in August",
  "Absalom, Absalom!",
  "Beloved",
  "Song of Solomon",
  "The Bluest Eye",
  "Sula",
  "Jazz",
  "Paradise",
  "A Mercy",
  "Home",
  "God Help the Child",
  "The Color Purple",
  "Meridian",
  "The Temple of My Familiar",
  "Possessing the Secret of Joy",
  "By the Light of My Father's Smile",
  "Now Is the Time to Open Your Heart",
  "The Third Life of Grange Copeland",
  "In Love & Trouble",
  "You Can't Keep a Good Woman Down",
  "Living by the Word",
  "Anything We Love Can Be Saved",
  "The Same River Twice",
  "We Are the Ones We Have Been Waiting For",
  "Hard Times Require Furious Dancing",
  "The Chicken Chronicles",
  "Taking the Arrow Out of the Heart",
  "Gathering Blossoms Under Fire",
  "The Invisible Man",
  "Native Son",
  "Black Boy",
  "Go Tell It on the Mountain",
  "Giovanni's Room",
  "Another Country",
  "The Fire Next Time",
  "Notes of a Native Son",
  "Nobody Knows My Name",
  "If Beale Street Could Talk",
  "Just Above My Head"
];

// Routes
app.get('/api/books', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    // Filter books based on search query
    let filteredBooks = books;
    if (search) {
      filteredBooks = books.filter(book => 
        book.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalBooks = filteredBooks.length;
    const totalPages = Math.ceil(totalBooks / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({ 
      success: true, 
      data: paginatedBooks,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalBooks: totalBooks,
        booksPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      search: search || null
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch books' 
    });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Books API Server', 
    version: '2.0.0',
    endpoints: {
      books: '/api/books',
      'books with pagination': '/api/books?page=1&limit=20',
      'books with search': '/api/books?search=harry',
      'books with both': '/api/books?page=1&limit=10&search=lord'
    },
    parameters: {
      page: 'Page number (default: 1)',
      limit: 'Books per page (default: 20)',
      search: 'Search books by name (case-insensitive)'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at: http://localhost:${PORT}/api/books`);
});