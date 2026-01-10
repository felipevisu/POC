import { randomUUID } from "crypto";
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

app.post("/start-task", (req, res) => {
  const taskId = randomUUID();

  tasks[taskId] = {
    progress: 0,
    status: "Starting...",
    complete: false,
  };

  runTask(taskId);

  res.send(`
        <div hx-get="/check-progress/${taskId}"
             hx-trigger="every 1s"
             hx-target="this"
             hx-swap="outerHTML">
            <h3>Task Starting...</h3>
            <p>Progress: 0%</p>
        </div>
    `);
});

app.get("/check-progress/:taskId", (req, res) => {
  const { taskId } = req.params;
  const task = tasks[taskId] || {};

  if (task.complete) {
    res.send(`
            <div>
                <h3>✓ Task Complete!</h3>
                <div style="width: 100%; background: #eee; border-radius: 4px; overflow: hidden;">
                    <div style="width: 100%; background: green; height: 20px;"></div>
                </div>
                <p><strong>${task.result}</strong></p>
                <button hx-post="/start-task"
                        hx-target="#task-container"
                        hx-swap="innerHTML"
                        class="btn">
                    Start New Task
                </button>
            </div>
        `);
  } else {
    res.send(`
            <div hx-get="/check-progress/${taskId}"
                 hx-trigger="every 1s"
                 hx-target="this"
                 hx-swap="outerHTML">
                <h3>Task in Progress...</h3>
                <div style="width: 100%; background: #eee; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${task.progress}%; background: blue; height: 20px; transition: width 0.3s;"></div>
                </div>
                <p>Progress: ${task.progress}%</p>
                <p>Status: ${task.status}</p>
            </div>
        `);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
