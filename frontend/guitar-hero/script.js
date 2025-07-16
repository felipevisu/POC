const columns = {
  a: document.querySelector('[data-key="a"]'),
  s: document.querySelector('[data-key="s"]'),
  d: document.querySelector('[data-key="d"]'),
  f: document.querySelector('[data-key="f"]')
};

const keyColors = {
  a: 'green',
  s: 'red',
  d: 'yellow',
  f: 'blue'
};

const keys = ["a", "s", "d", "f"];
const speed = 2;
let notes = [];

let score = 0;
const scoreDisplay = document.getElementById("score");

function updateScore(points) {
  score += points;
  scoreDisplay.textContent = `Score: ${score}`;
}

function createHitZones() {
  for (const key of keys) {
    const hitZone = document.createElement("div");
    hitZone.classList.add("hit-zone");
    columns[key].appendChild(hitZone);
  }
}

function createNote() {
  const key = keys[Math.floor(Math.random() * keys.length)];
  const note = document.createElement("div");
  note.classList.add("note");
  note.dataset.key = key;
  note.style.top = "-20px";
  columns[key].appendChild(note);
  notes.push(note);
}

function moveNotes() {
  for (const note of notes) {
    const top = parseFloat(note.style.top);
    note.style.top = top + speed + "px";

    if (top > 500) {
      // Remove nota se sair da tela
      note.remove();
    }
  }

  notes = notes.filter(note => note.isConnected);
}

function gameLoop() {
  moveNotes();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (!keys.includes(key)) return;

  const col = columns[key];
  const hitZone = col.querySelector('.hit-zone');
  const hitZoneY = 480;

  const matchingNotes = Array.from(col.querySelectorAll(".note")).filter(note => {
    const top = parseFloat(note.style.top);
    return top >= hitZoneY - 20 && top <= hitZoneY + 20;
  });

  if (matchingNotes.length > 0) {
    const note = matchingNotes[0];
    note.remove();
    updateScore(100);

    // 💥 Hit visual
    col.classList.add("hit");
    col.style.color = keyColors[key]; // for box-shadow color
    setTimeout(() => col.classList.remove("hit"), 1000);
  } else {
    // ❌ Miss visual
    hitZone.classList.add("fade");
    setTimeout(() => hitZone.classList.remove("fade"), 1000);
  }
});
createHitZones();
setInterval(createNote, 1000);
gameLoop();
