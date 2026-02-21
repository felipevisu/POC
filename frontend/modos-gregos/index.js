const notes = ["A", "B", "C", "D", "E", "F", "G"];
const intervals = [1, 0.5, 1, 1, 0.5, 1, 1];

const chromaticNotes = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

const tuningPresets = {
  standard: ["E", "A", "D", "G", "B", "E"],
  drop_d: ["D", "A", "D", "G", "B", "E"],
  dadgad: ["D", "A", "D", "G", "A", "D"],
  open_g: ["D", "G", "D", "G", "B", "D"],
};

const modes = {
  jonio: [1, 1, 0.5, 1, 1, 1, 0.5],
  dorico: [1, 0.5, 1, 1, 1, 0.5, 1],
  frigio: [0.5, 1, 1, 1, 0.5, 1, 1],
  lidio: [1, 1, 1, 0.5, 1, 1, 0.5],
  mixolidio: [1, 1, 0.5, 1, 1, 0.5, 1],
  eolio: [1, 0.5, 1, 1, 0.5, 1, 1],
  locrio: [0.5, 1, 1, 0.5, 1, 1, 1],
};

const pentatonics = {
  penta_maior: { parent: "jonio", degrees: [1, 2, 3, 5, 6] },
  penta_menor: { parent: "eolio", degrees: [1, 3, 4, 5, 7] },
};

// ── i18n ──

const translations = {
  en: {
    title: "Guitar Fretboard — Scales & Modes",
    labelRoot: "Root Note:",
    labelMode: "Scale / Mode:",
    labelFrets: "Frets:",
    labelTuning: "Tuning:",
    noteNames: {
      C: "C (Do)", "C#": "C# (Do#)", Db: "Db (Reb)",
      D: "D (Re)", "D#": "D# (Re#)", Eb: "Eb (Mib)",
      E: "E (Mi)", F: "F (Fa)", "F#": "F# (Fa#)",
      Gb: "Gb (Solb)", G: "G (Sol)", "G#": "G# (Sol#)",
      Ab: "Ab (Lab)", A: "A (La)", "A#": "A# (La#)",
      Bb: "Bb (Sib)", B: "B (Si)",
    },
    modeNames: {
      jonio: "Ionian (Major)",
      dorico: "Dorian",
      frigio: "Phrygian",
      lidio: "Lydian",
      mixolidio: "Mixolydian",
      eolio: "Aeolian (Minor)",
      locrio: "Locrian",
      penta_maior: "Major Pentatonic",
      penta_menor: "Minor Pentatonic",
    },
    groupModes: "Greek Modes",
    groupPentatonics: "Pentatonics",
    modeDescriptions: {
      jonio: "Bright, happy sound — the traditional major scale",
      dorico: "Minor with a major 6th — jazzy and sophisticated",
      frigio: "Minor with a minor 2nd — exotic and Spanish-flavored",
      lidio: "Major with a raised 4th — ethereal and mysterious",
      mixolidio: "Major with a minor 7th — rock and blues",
      eolio: "Natural minor — melancholic and sad",
      locrio: "Diminished and unstable — rarely used in popular music",
      penta_maior: "5 notes from the major scale — versatile and consonant, widely used in rock, country, and pop",
      penta_menor: "5 notes from the minor scale — essential for blues, rock, and improvisation",
    },
    tuningStandard: "Standard (E-A-D-G-B-E)",
    tuningDropD: "Drop D (D-A-D-G-B-E)",
    tuningDADGAD: "DADGAD (D-A-D-G-A-D)",
    tuningOpenG: "Open G (D-G-D-G-B-D)",
    tuningCustom: "Custom",
    stringOrdinal: (n) => {
      const suffixes = { 1: "st", 2: "nd", 3: "rd" };
      return (suffixes[n] || "th");
    },
    legendText: "Root = gold &nbsp;|&nbsp; Scale notes = red",
    scaleInfoPrefix: "in",
    scaleInfoPlaceholder: "Select a note and a mode to see the scale",
  },
  pt: {
    title: "Braço da Guitarra — Escalas e Modos",
    labelRoot: "Nota Fundamental:",
    labelMode: "Escala / Modo:",
    labelFrets: "Trastes:",
    labelTuning: "Afinação:",
    noteNames: {
      C: "C (Dó)", "C#": "C# (Dó#)", Db: "Db (Réb)",
      D: "D (Ré)", "D#": "D# (Ré#)", Eb: "Eb (Mib)",
      E: "E (Mi)", F: "F (Fá)", "F#": "F# (Fá#)",
      Gb: "Gb (Solb)", G: "G (Sol)", "G#": "G# (Sol#)",
      Ab: "Ab (Láb)", A: "A (Lá)", "A#": "A# (Lá#)",
      Bb: "Bb (Sib)", B: "B (Si)",
    },
    modeNames: {
      jonio: "Jônio (Maior)",
      dorico: "Dórico",
      frigio: "Frígio",
      lidio: "Lídio",
      mixolidio: "Mixolídio",
      eolio: "Eólio (Menor)",
      locrio: "Lócrio",
      penta_maior: "Pentatônica Maior",
      penta_menor: "Pentatônica Menor",
    },
    groupModes: "Modos Gregos",
    groupPentatonics: "Pentatônicas",
    modeDescriptions: {
      jonio: "Som alegre e brilhante - escala maior tradicional",
      dorico: "Som menor com 6ª maior - jazzy e sofisticado",
      frigio: "Som menor com 2ª menor - exótico e espanhol",
      lidio: "Som maior com 4ª aumentada - etéreo e misterioso",
      mixolidio: "Som maior com 7ª menor - rock e blues",
      eolio: "Som menor natural - melancólico e triste",
      locrio: "Som diminuto e instável - raro na música popular",
      penta_maior: "5 notas da escala maior - versátil e consonante, muito usada em rock, country e pop",
      penta_menor: "5 notas da escala menor - essencial para blues, rock e improvisação",
    },
    tuningStandard: "Padrão (E-A-D-G-B-E)",
    tuningDropD: "Drop D (D-A-D-G-B-E)",
    tuningDADGAD: "DADGAD (D-A-D-G-A-D)",
    tuningOpenG: "Open G (D-G-D-G-B-D)",
    tuningCustom: "Personalizado",
    stringOrdinal: () => "ª",
    legendText: "Fundamental = dourado &nbsp;|&nbsp; Notas da escala = vermelho",
    scaleInfoPrefix: "em",
    scaleInfoPlaceholder: "Selecione uma nota e um modo para ver a escala",
  },
  es: {
    title: "Mástil de Guitarra — Escalas y Modos",
    labelRoot: "Nota Fundamental:",
    labelMode: "Escala / Modo:",
    labelFrets: "Trastes:",
    labelTuning: "Afinación:",
    noteNames: {
      C: "C (Do)", "C#": "C# (Do#)", Db: "Db (Reb)",
      D: "D (Re)", "D#": "D# (Re#)", Eb: "Eb (Mib)",
      E: "E (Mi)", F: "F (Fa)", "F#": "F# (Fa#)",
      Gb: "Gb (Solb)", G: "G (Sol)", "G#": "G# (Sol#)",
      Ab: "Ab (Lab)", A: "A (La)", "A#": "A# (La#)",
      Bb: "Bb (Sib)", B: "B (Si)",
    },
    modeNames: {
      jonio: "Jónico (Mayor)",
      dorico: "Dórico",
      frigio: "Frigio",
      lidio: "Lidio",
      mixolidio: "Mixolidio",
      eolio: "Eólico (Menor)",
      locrio: "Locrio",
      penta_maior: "Pentatónica Mayor",
      penta_menor: "Pentatónica Menor",
    },
    groupModes: "Modos Griegos",
    groupPentatonics: "Pentatónicas",
    modeDescriptions: {
      jonio: "Sonido alegre y brillante — la escala mayor tradicional",
      dorico: "Menor con 6ª mayor — jazzy y sofisticado",
      frigio: "Menor con 2ª menor — exótico y español",
      lidio: "Mayor con 4ª aumentada — etéreo y misterioso",
      mixolidio: "Mayor con 7ª menor — rock y blues",
      eolio: "Menor natural — melancólico y triste",
      locrio: "Disminuido e inestable — raro en la música popular",
      penta_maior: "5 notas de la escala mayor — versátil y consonante, muy usada en rock, country y pop",
      penta_menor: "5 notas de la escala menor — esencial para blues, rock e improvisación",
    },
    tuningStandard: "Estándar (E-A-D-G-B-E)",
    tuningDropD: "Drop D (D-A-D-G-B-E)",
    tuningDADGAD: "DADGAD (D-A-D-G-A-D)",
    tuningOpenG: "Open G (D-G-D-G-B-D)",
    tuningCustom: "Personalizado",
    stringOrdinal: () => "ª",
    legendText: "Fundamental = dorado &nbsp;|&nbsp; Notas de la escala = rojo",
    scaleInfoPrefix: "en",
    scaleInfoPlaceholder: "Seleccione una nota y un modo para ver la escala",
  },
};

let currentLang = localStorage.getItem("lang") || "pt";

function t(key) {
  return translations[currentLang][key];
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
  document.title = t("title");

  // Update static data-i18n elements (skip optgroups — handled separately)
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (el.tagName === "OPTGROUP") return;
    const key = el.getAttribute("data-i18n");
    const val = t(key);
    if (val != null) el.textContent = val;
  });

  // Update data-i18n-html elements (for innerHTML like legend)
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const val = t(key);
    if (val != null) el.innerHTML = val;
  });

  // Re-populate note select
  const noteSelect = document.getElementById("noteSelect");
  const currentNote = noteSelect.value;
  const noteNames = t("noteNames");
  Array.from(noteSelect.options).forEach((opt) => {
    opt.textContent = noteNames[opt.value] || opt.value;
  });
  noteSelect.value = currentNote;

  // Re-populate mode select
  const modeSelect = document.getElementById("modeSelect");
  const currentMode = modeSelect.value;
  const modeNames = t("modeNames");
  Array.from(modeSelect.querySelectorAll("optgroup")).forEach((group) => {
    const key = group.getAttribute("data-i18n");
    if (key) group.label = t(key);
  });
  Array.from(modeSelect.options).forEach((opt) => {
    opt.textContent = modeNames[opt.value] || opt.value;
  });
  modeSelect.value = currentMode;

  // Re-populate tuning preset select
  const tuningSelect = document.getElementById("tuningPreset");
  const currentTuning = tuningSelect.value;
  const tuningMap = {
    standard: "tuningStandard",
    drop_d: "tuningDropD",
    dadgad: "tuningDADGAD",
    open_g: "tuningOpenG",
    custom: "tuningCustom",
  };
  Array.from(tuningSelect.options).forEach((opt) => {
    const tKey = tuningMap[opt.value];
    if (tKey) opt.textContent = t(tKey);
  });
  tuningSelect.value = currentTuning;

  // Update string ordinal labels
  const stringLabels = document.querySelectorAll(".string-tuning label");
  stringLabels.forEach((lbl, i) => {
    const n = 6 - i;
    lbl.textContent = n + t("stringOrdinal")(n);
  });

  // Update language switcher active state
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  updateFretboard();
}

// ── End i18n ──

function getCurrentTuning() {
  const ids = ["string6", "string5", "string4", "string3", "string2", "string1"];
  return ids.map((id) => document.getElementById(id).value);
}

function getCurrentFrets() {
  return parseInt(document.getElementById("fretCount").value, 10);
}

function generateArmMatrix(tuning, fretCount) {
  const arm = [];
  const reversedTuning = [...tuning].reverse();

  for (let string = 0; string < tuning.length; string++) {
    arm.push([]);
    const baseNote = reversedTuning[string];

    let baseIndex = chromaticNotes.findIndex(
      (note) =>
        note === baseNote || normalizeNote(note) === normalizeNote(baseNote)
    );

    for (let fret = 0; fret <= fretCount; fret++) {
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

function getScaleDegree(fretNote, scale) {
  for (let i = 0; i < scale.length; i++) {
    const scaleNote = scale[i];
    if (fretNote === scaleNote) return i + 1;

    const normalizedFret = normalizeNote(fretNote);
    const normalizedScale = normalizeNote(scaleNote);

    if (
      normalizedFret === normalizedScale ||
      normalizedFret === scaleNote ||
      fretNote === normalizedScale
    ) {
      return i + 1;
    }
  }
  return null;
}

const dotFrets = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const doubleDotFrets = new Set([12, 24]);

function renderFretboard(scale, rootNote, tuning, fretCount) {
  const arm = generateArmMatrix(tuning, fretCount);
  const reversedTuning = [...tuning].reverse();
  const strings = tuning.length;
  const table = document.getElementById("fretboardTable");
  table.innerHTML = "";

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));

  for (let fret = 1; fret <= fretCount; fret++) {
    const th = document.createElement("th");
    th.textContent = fret;
    th.className = "fret-header";
    if (doubleDotFrets.has(fret)) th.className += " has-double-dot";
    else if (dotFrets.has(fret)) th.className += " has-dot";
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  for (let string = 0; string < strings; string++) {
    const row = document.createElement("tr");

    const stringCell = document.createElement("td");
    const n = string + 1;
    stringCell.textContent = `${n}${t("stringOrdinal")(n)} (${reversedTuning[string]})`;
    stringCell.className = "string-label";
    row.appendChild(stringCell);

    for (let fret = 1; fret <= fretCount; fret++) {
      const cell = document.createElement("td");
      const note = arm[string][fret];
      cell.className = "fret-cell";

      const degree = getScaleDegree(note, scale);
      if (degree !== null) {
        cell.innerHTML = `<span class="note-badge"><span class="note-name">${note}</span><span class="degree-number">${degree}</span></span>`;
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
  const tuning = getCurrentTuning();
  const fretCount = getCurrentFrets();

  let scale;
  if (pentatonics[selectedMode]) {
    const penta = pentatonics[selectedMode];
    const fullScale = generateScale(penta.parent, selectedNote);
    scale = penta.degrees.map((d) => fullScale[d - 1]);
  } else {
    scale = generateScale(selectedMode, selectedNote);
  }

  const scaleInfo = document.getElementById("scaleInfo");
  const modeNames = t("modeNames");

  scaleInfo.innerHTML = `
    <div><strong>${modeNames[selectedMode]} ${t("scaleInfoPrefix")} ${selectedNote}</strong></div>
    <div class="scale-notes">${scale.join("  ·  ")}</div>
    <div class="legend">${t("legendText")}</div>
  `;

  const modeDesc = document.getElementById("modeDescription");
  modeDesc.textContent = t("modeDescriptions")[selectedMode];

  renderFretboard(scale, selectedNote, tuning, fretCount);
}

function initTuningControls() {
  const stringIds = ["string6", "string5", "string4", "string3", "string2", "string1"];
  const defaultTuning = tuningPresets.standard;

  stringIds.forEach((id, i) => {
    const select = document.getElementById(id);
    chromaticNotes.forEach((note) => {
      const option = document.createElement("option");
      option.value = note;
      option.textContent = note;
      select.appendChild(option);
    });
    select.value = defaultTuning[i];
    select.addEventListener("change", () => {
      document.getElementById("tuningPreset").value = "custom";
      updateFretboard();
    });
  });

  document.getElementById("tuningPreset").addEventListener("change", (e) => {
    const preset = e.target.value;
    if (preset === "custom") return;
    const tuning = tuningPresets[preset];
    stringIds.forEach((id, i) => {
      document.getElementById(id).value = tuning[i];
    });
    updateFretboard();
  });

  document.getElementById("fretCount").addEventListener("change", updateFretboard);
}

document.addEventListener("DOMContentLoaded", function () {
  initTuningControls();

  // Init language switcher
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  setLanguage(currentLang);

  document
    .getElementById("noteSelect")
    .addEventListener("change", updateFretboard);
  document
    .getElementById("modeSelect")
    .addEventListener("change", updateFretboard);
});
