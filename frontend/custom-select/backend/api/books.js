const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));

// Sample data: 100 books with id and name
const books = [
  { id: 1, name: "To Kill a Mockingbird" },
  { id: 2, name: "1984" },
  { id: 3, name: "Pride and Prejudice" },
  { id: 4, name: "The Great Gatsby" },
  { id: 5, name: "One Hundred Years of Solitude" },
  { id: 6, name: "In Cold Blood" },
  { id: 7, name: "Wide Sargasso Sea" },
  { id: 8, name: "Brave New World" },
  { id: 9, name: "I Capture The Castle" },
  { id: 10, name: "Jane Eyre" },
  { id: 11, name: "Crime and Punishment" },
  { id: 12, name: "The Secret History" },
  { id: 13, name: "The Lord of the Rings" },
  { id: 14, name: "The Handmaid's Tale" },
  { id: 15, name: "The Time Traveler's Wife" },
  { id: 16, name: "The Book Thief" },
  { id: 17, name: "Wuthering Heights" },
  { id: 18, name: "The Kite Runner" },
  { id: 19, name: "Life of Pi" },
  { id: 20, name: "The Chronicles of Narnia" },
  { id: 21, name: "Harry Potter and the Sorcerer's Stone" },
  { id: 22, name: "The Catcher in the Rye" },
  { id: 23, name: "Of Mice and Men" },
  { id: 24, name: "The Grapes of Wrath" },
  { id: 25, name: "Fahrenheit 451" },
  { id: 26, name: "Animal Farm" },
  { id: 27, name: "The Hobbit" },
  { id: 28, name: "Dune" },
  { id: 29, name: "Foundation" },
  { id: 30, name: "The Martian" },
  { id: 31, name: "Ender's Game" },
  { id: 32, name: "The Hitchhiker's Guide to the Galaxy" },
  { id: 33, name: "Neuromancer" },
  { id: 34, name: "The Left Hand of Darkness" },
  { id: 35, name: "Hyperion" },
  { id: 36, name: "The Name of the Wind" },
  { id: 37, name: "A Game of Thrones" },
  { id: 38, name: "The Way of Kings" },
  { id: 39, name: "Mistborn: The Final Empire" },
  { id: 40, name: "The Eye of the World" },
  { id: 41, name: "The Fellowship of the Ring" },
  { id: 42, name: "The Two Towers" },
  { id: 43, name: "The Return of the King" },
  { id: 44, name: "The Silmarillion" },
  { id: 45, name: "The Stand" },
  { id: 46, name: "It" },
  { id: 47, name: "The Shining" },
  { id: 48, name: "Carrie" },
  { id: 49, name: "Pet Sematary" },
  { id: 50, name: "Salem's Lot" },
  { id: 51, name: "The Dark Tower: The Gunslinger" },
  { id: 52, name: "Dracula" },
  { id: 53, name: "Frankenstein" },
  { id: 54, name: "The Strange Case of Dr. Jekyll and Mr. Hyde" },
  { id: 55, name: "The Picture of Dorian Gray" },
  { id: 56, name: "Heart of Darkness" },
  { id: 57, name: "The Sun Also Rises" },
  { id: 58, name: "For Whom the Bell Tolls" },
  { id: 59, name: "A Farewell to Arms" },
  { id: 60, name: "The Old Man and the Sea" },
  { id: 61, name: "The Sound and the Fury" },
  { id: 62, name: "As I Lay Dying" },
  { id: 63, name: "Light in August" },
  { id: 64, name: "Absalom, Absalom!" },
  { id: 65, name: "Beloved" },
  { id: 66, name: "Song of Solomon" },
  { id: 67, name: "The Bluest Eye" },
  { id: 68, name: "Sula" },
  { id: 69, name: "Jazz" },
  { id: 70, name: "Paradise" },
  { id: 71, name: "A Mercy" },
  { id: 72, name: "Home" },
  { id: 73, name: "God Help the Child" },
  { id: 74, name: "The Color Purple" },
  { id: 75, name: "Meridian" },
  { id: 76, name: "The Temple of My Familiar" },
  { id: 77, name: "Possessing the Secret of Joy" },
  { id: 78, name: "By the Light of My Father's Smile" },
  { id: 79, name: "Now Is the Time to Open Your Heart" },
  { id: 80, name: "The Third Life of Grange Copeland" },
  { id: 81, name: "In Love & Trouble" },
  { id: 82, name: "You Can't Keep a Good Woman Down" },
  { id: 83, name: "Living by the Word" },
  { id: 84, name: "Anything We Love Can Be Saved" },
  { id: 85, name: "The Same River Twice" },
  { id: 86, name: "We Are the Ones We Have Been Waiting For" },
  { id: 87, name: "Hard Times Require Furious Dancing" },
  { id: 88, name: "The Chicken Chronicles" },
  { id: 89, name: "Taking the Arrow Out of the Heart" },
  { id: 90, name: "Gathering Blossoms Under Fire" },
  { id: 91, name: "The Invisible Man" },
  { id: 92, name: "Native Son" },
  { id: 93, name: "Black Boy" },
  { id: 94, name: "Go Tell It on the Mountain" },
  { id: 95, name: "Giovanni's Room" },
  { id: 96, name: "Another Country" },
  { id: 97, name: "The Fire Next Time" },
  { id: 98, name: "Notes of a Native Son" },
  { id: 99, name: "Nobody Knows My Name" },
  { id: 100, name: "If Beale Street Could Talk" },
  { id: 101, name: "Just Above My Head" },
];

app.get("/api/books", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    // Filter books based on search query
    let filteredBooks = books;
    if (search) {
      filteredBooks = books.filter((book) =>
        book.name.toLowerCase().includes(search.toLowerCase())
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
        prevPage: hasPrevPage ? page - 1 : null,
      },
      search: search || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch books",
    });
  }
});

module.exports = app;
