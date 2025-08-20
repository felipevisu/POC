const notes = ["A", "B", "C", "D", "E", "F", "G"];
const intervals = [1, 0.5, 1, 1, 0.5, 1, 1];
const tune = ["E", "A", "D", "G", "B", "E"];
const reversedTune = [...tune].reverse();

const modes = {
  jonio: [1, 1, 0.5, 1, 1, 1, 0.5],
  dorico: [1, 0.5, 1, 1, 1, 0.5, 1],
  frigio: [0.5, 1, 1, 1, 0.5, 1, 1],
  lidio: [1, 1, 1, 0.5, 1, 1, 0.5],
  mixolidio: [1, 1, 0.5, 1, 1, 0.5, 1],
  eolio: [1, 0.5, 1, 1, 0.5, 1, 1],
  locrio: [0.5, 1, 1, 0.5, 1, 1, 1],
};

const modeDescriptions = {
  jonio: "Som alegre e brilhante - escala maior tradicional",
  dorico: "Som menor com 6ª maior - jazzy e sofisticado",
  frigio: "Som menor com 2ª menor - exótico e espanhol",
  lidio: "Som maior com 4ª aumentada - etéreo e misterioso",
  mixolidio: "Som maior com 7ª menor - rock e blues",
  eolio: "Som menor natural - melancólico e triste",
  locrio: "Som diminuto e instável - raro na música popular",
};

const strings = 6;
const frets = 15;

function generateArmMatrix() {
  const arm = [];
  const chromaticNotes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  for (let string = 0; string < strings; string++) {
    arm.push([]);
    const baseNote = reversedTune[string];

    let baseIndex = chromaticNotes.findIndex(
      (note) =>
        note === baseNote || normalizeNote(note) === normalizeNote(baseNote)
    );

    for (let fret = 0; fret <= frets; fret++) {
      const chromaticIndex = (baseIndex + fret) % 12;
      arm[string].push(chromaticNotes[chromaticIndex]);
    }
  }
  return arm;
}

function getNoteIndex(note) {
  const naturalNote = note.replace(/[#b]/g, "");
  return notes.indexOf(naturalNote);
}

function countAccidentals(note) {
  let accidentals = 0;
  if (note.includes("#")) {
    accidentals += (note.match(/#/g) || []).length;
  }
  if (note.includes("b")) {
    accidentals -= (note.match(/b/g) || []).length;
  }
  return accidentals;
}

function applyAccidentals(naturalNote, accidentalCount) {
  if (accidentalCount === 0) {
    return naturalNote;
  }

  if (accidentalCount === 2) {
    const noteIndex = notes.indexOf(naturalNote);
    const nextNoteIndex = (noteIndex + 1) % 7;
    return notes[nextNoteIndex];
  } else if (accidentalCount === -2) {
    const noteIndex = notes.indexOf(naturalNote);
    const prevNoteIndex = (noteIndex - 1 + 7) % 7;
    return notes[prevNoteIndex];
  } else if (accidentalCount > 0) {
    return naturalNote + "#".repeat(accidentalCount);
  } else {
    return naturalNote + "b".repeat(Math.abs(accidentalCount));
  }
}

function generateScale(mode, note) {
  const modeIntervals = modes[mode];
  const scale = [note];

  let currentNoteIndex = getNoteIndex(note);
  let currentAccidentals = countAccidentals(note);

  for (let i = 0; i < modeIntervals.length - 1; i++) {
    const nextNoteIndex = (currentNoteIndex + 1) % 7;
    const nextNaturalNote = notes[nextNoteIndex];

    const naturalInterval = intervals[currentNoteIndex];
    const requiredInterval = modeIntervals[i];

    const naturalSemitones = naturalInterval === 1 ? 2 : 1;
    const requiredSemitones = requiredInterval === 1 ? 2 : 1;

    const difference = requiredSemitones - naturalSemitones;
    const nextAccidentals = currentAccidentals + difference;

    const nextNote = applyAccidentals(nextNaturalNote, nextAccidentals);

    scale.push(nextNote);
    currentNoteIndex = nextNoteIndex;
    currentAccidentals = nextAccidentals;
  }

  return scale;
}

function normalizeNote(note) {
  const enharmonicMap = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#",
    "E#": "F",
    "B#": "C",
    Fb: "E",
    Cb: "B",
  };
  return enharmonicMap[note] || note;
}

function isNoteInScale(fretNote, scale) {
  return scale.some((scaleNote) => {
    if (fretNote === scaleNote) return true;

    const normalizedFret = normalizeNote(fretNote);
    const normalizedScale = normalizeNote(scaleNote);

    return (
      normalizedFret === normalizedScale ||
      normalizedFret === scaleNote ||
      fretNote === normalizedScale
    );
  });
}

function renderFretboard(scale, rootNote) {
  const arm = generateArmMatrix();
  const table = document.getElementById("fretboardTable");
  table.innerHTML = "";

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));

  for (let fret = 1; fret <= frets; fret++) {
    const th = document.createElement("th");
    th.textContent = fret;
    th.className = "fret-header";
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  for (let string = 0; string < strings; string++) {
    const row = document.createElement("tr");

    const stringCell = document.createElement("td");
    stringCell.textContent = `${string + 1}ª (${reversedTune[string]})`;
    stringCell.className = "string-label";
    row.appendChild(stringCell);

    for (let fret = 1; fret <= frets; fret++) {
      const cell = document.createElement("td");
      const note = arm[string][fret];
      cell.textContent = note;
      cell.className = "fret-cell";

      if (isNoteInScale(note, scale)) {
        if (
          normalizeNote(note) === normalizeNote(rootNote) ||
          note === rootNote
        ) {
          cell.className += " root-note";
        } else {
          cell.className += " note-in-scale";
        }
      }

      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

function updateFretboard() {
  const selectedNote = document.getElementById("noteSelect").value;
  const selectedMode = document.getElementById("modeSelect").value;

  const scale = generateScale(selectedMode, selectedNote);

  const scaleInfo = document.getElementById("scaleInfo");
  const modeNames = {
    jonio: "Jônio (Maior)",
    dorico: "Dórico",
    frigio: "Frígio",
    lidio: "Lídio",
    mixolidio: "Mixolídio",
    eolio: "Eólio (Menor)",
    locrio: "Lócrio",
  };

  scaleInfo.innerHTML = `
                <div><strong>${
                  modeNames[selectedMode]
                } em ${selectedNote}</strong></div>
                <div class="scale-notes">${scale.join(" - ")}</div>
                <div>🟡 = Nota fundamental | 🔴 = Notas da escala</div>
            `;

  const modeDesc = document.getElementById("modeDescription");
  modeDesc.textContent = modeDescriptions[selectedMode];

  renderFretboard(scale, selectedNote);
}

document.addEventListener("DOMContentLoaded", function () {
  updateFretboard();
  document
    .getElementById("noteSelect")
    .addEventListener("change", updateFretboard);
  document
    .getElementById("modeSelect")
    .addEventListener("change", updateFretboard);
});
