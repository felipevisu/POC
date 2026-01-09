import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const songs = [
  { id: 1, title: "Bohemian Rhapsody", artist: "Queen" },
  { id: 2, title: "Stairway to Heaven", artist: "Led Zeppelin" },
  { id: 3, title: "Hotel California", artist: "Eagles" },
  { id: 4, title: "Imagine", artist: "John Lennon" },
  { id: 5, title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
  { id: 6, title: "Smells Like Teen Spirit", artist: "Nirvana" },
  { id: 7, title: "Yesterday", artist: "The Beatles" },
  { id: 8, title: "Hey Jude", artist: "The Beatles" },
  { id: 9, title: "Wonderwall", artist: "Oasis" },
  { id: 10, title: "November Rain", artist: "Guns N' Roses" },
];

app.use(express.static(__dirname));

app.get("/music", (req, res) => {
  const query = req.query.q || "";

  let filteredSongs = songs;
  if (query.trim() !== "") {
    const searchTerm = query.toLowerCase();
    filteredSongs = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
    );
  }

  let html = '<ul style="list-style: none; padding: 0;">';
  if (filteredSongs.length > 0) {
    filteredSongs.forEach((song) => {
      html += `<li style="padding: 8px; border-bottom: 1px solid #eee;">
        <strong>${song.title}</strong> - ${song.artist}
      </li>`;
    });
  } else {
    html += '<li style="padding: 8px; color: #999;">No songs found</li>';
  }
  html += "</ul>";

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
