import { randomUUID } from "crypto";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

app.get("/music", async (req, res) => {
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

  const html = await ejs.renderFile(
    path.join(__dirname, "views", "song-list.ejs"),
    { songs: filteredSongs }
  );
  res.send(html);
});

const tasks = {};

function runTask(taskId) {
  let progress = 0;

  const interval = setInterval(() => {
    progress += 10;

    if (progress <= 100) {
      tasks[taskId] = {
        progress: progress,
        status: progress < 100 ? "Processing..." : "Done!",
        complete: progress === 100,
        result: progress === 100 ? "Task finished successfully!" : null,
      };
    }

    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 1000);
}

app.post("/start-task", async (req, res) => {
  const taskId = randomUUID();

  tasks[taskId] = {
    progress: 0,
    status: "Starting...",
    complete: false,
  };

  runTask(taskId);

  const html = await ejs.renderFile(
    path.join(__dirname, "views", "task-starting.ejs"),
    { taskId }
  );
  res.send(html);
});

app.get("/check-progress/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const task = tasks[taskId] || {};

  if (task.complete) {
    const html = await ejs.renderFile(
      path.join(__dirname, "views", "task-complete.ejs"),
      { result: task.result }
    );
    res.send(html);
  } else {
    const html = await ejs.renderFile(
      path.join(__dirname, "views", "task-progress.ejs"),
      { taskId, progress: task.progress, status: task.status }
    );
    res.send(html);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
