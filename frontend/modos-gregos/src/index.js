import i18next from "i18next";
import en from "./locales/en.json";
import pt from "./locales/pt.json";
import es from "./locales/es.json";

i18next.init({
  lng: localStorage.getItem("lang") || "pt",
  fallbackLng: "pt",
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es },
  },
  returnObjects: true,
  initImmediate: false,
});

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
  standard_7: ["B", "E", "A", "D", "G", "B", "E"],
  drop_a_7: ["A", "E", "A", "D", "G", "B", "E"],
  bass_standard: ["E", "A", "D", "G"],
  bass_drop_d: ["D", "A", "D", "G"],
  bass_5_standard: ["B", "E", "A", "D", "G"],
  ukulele_standard: ["G", "C", "E", "A"],
  ukulele_baritone: ["D", "G", "B", "E"],
};

const modes = {
  jonio: [1, 1, 0.5, 1, 1, 1, 0.5],
  dorico: [1, 0.5, 1, 1, 1, 0.5, 1],
  frigio: [0.5, 1, 1, 1, 0.5, 1, 1],
  lidio: [1, 1, 1, 0.5, 1, 1, 0.5],
  mixolidio: [1, 1, 0.5, 1, 1, 0.5, 1],
  eolio: [1, 0.5, 1, 1, 0.5, 1, 1],
  locrio: [0.5, 1, 1, 0.5, 1, 1, 1],
  harmonic_minor: [1, 0.5, 1, 1, 0.5, 1.5, 0.5],
  melodic_minor: [1, 0.5, 1, 1, 1, 1, 0.5],
  phrygian_dom: [0.5, 1.5, 0.5, 1, 0.5, 1, 1],
  lydian_s2: [1.5, 0.5, 1, 0.5, 1, 1, 0.5],
  lydian_dom: [1, 1, 1, 0.5, 1, 0.5, 1],
  altered: [0.5, 1, 0.5, 1, 1, 1, 1],
  hungarian_minor: [1, 0.5, 1.5, 0.5, 0.5, 1.5, 0.5],
};

const pentatonics = {
  penta_maior: { parent: "jonio", degrees: [1, 2, 3, 5, 6] },
  penta_menor: { parent: "eolio", degrees: [1, 3, 4, 5, 7] },
};

const chromaticScales = {
  blues_menor: [0, 3, 5, 6, 7, 10],
  blues_maior: [0, 2, 3, 4, 7, 9],
  whole_tone: [0, 2, 4, 6, 8, 10],
  dim_hw: [0, 1, 3, 4, 6, 7, 9, 10],
  dim_wh: [0, 2, 3, 5, 6, 8, 9, 11],
};

function generateChromaticScale(offsets, rootNote) {
  const rootIndex = chromaticNotes.indexOf(
    chromaticNotes.find(
      (n) => n === rootNote || normalizeNote(n) === normalizeNote(rootNote)
    )
  );
  return offsets.map((offset) => chromaticNotes[(rootIndex + offset) % 12]);
}

// ── i18n ──

function t(key) {
  return i18next.t(key);
}

function setLanguage(lang) {
  i18next.changeLanguage(lang);
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
    standard_7: "tuningStandard7",
    drop_a_7: "tuningDropA7",
    bass_standard: "tuningBassStandard",
    bass_drop_d: "tuningBassDropD",
    bass_5_standard: "tuningBass5Standard",
    ukulele_standard: "tuningUkuleleStandard",
    ukulele_baritone: "tuningUkuleleBaritone",
    custom: "tuningCustom",
  };
  Array.from(tuningSelect.querySelectorAll("optgroup")).forEach((group) => {
    const key = group.getAttribute("data-i18n");
    if (key) group.label = t(key);
  });
  Array.from(tuningSelect.options).forEach((opt) => {
    const tKey = tuningMap[opt.value];
    if (tKey) opt.textContent = t(tKey);
  });
  tuningSelect.value = currentTuning;

  // Update string ordinal labels
  const stringLabels = document.querySelectorAll(".string-tuning label");
  stringLabels.forEach((lbl, i) => {
    const n = stringLabels.length - i;
    lbl.textContent = n + i18next.t("stringOrdinal", { count: n, ordinal: true });
  });

  // Update language switcher active state
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  updateFretboard();
}

// ── End i18n ──

function getCurrentTuning() {
  const selects = document.querySelectorAll("#tuningStrings select");
  return Array.from(selects).map((s) => s.value);
}

function buildStringControls(tuning) {
  const container = document.getElementById("tuningStrings");
  container.innerHTML = "";
  tuning.forEach((note, i) => {
    const div = document.createElement("div");
    div.className = "string-tuning";
    const n = tuning.length - i;
    const label = document.createElement("label");
    label.textContent = n + i18next.t("stringOrdinal", { count: n, ordinal: true });
    const select = document.createElement("select");
    chromaticNotes.forEach((cn) => {
      const option = document.createElement("option");
      option.value = cn;
      option.textContent = cn;
      select.appendChild(option);
    });
    select.value = note;
    select.addEventListener("change", () => {
      document.getElementById("tuningPreset").value = "custom";
      updateFretboard();
    });
    div.appendChild(label);
    div.appendChild(select);
    container.appendChild(div);
  });
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
    const requiredSemitones = requiredInterval * 2;

    const difference = requiredSemitones - naturalSemitones;
    const nextAccidentals = currentAccidentals + difference;

    const nextNote = applyAccidentals(nextNaturalNote, nextAccidentals);

    scale.push(nextNote);
    currentNoteIndex = nextNoteIndex;
    currentAccidentals = nextAccidentals;
  }

  return scale;
}

function notesMatch(a, b) {
  return a === b || normalizeNote(a) === b || a === normalizeNote(b);
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

function getPositionFrets(scale, tuning, fretCount) {
  const arm = generateArmMatrix(tuning, fretCount);
  const lowStringIndex = tuning.length - 1;
  const frets = [];
  const maxFret = Math.min(fretCount, 11);
  for (let fret = 0; fret <= maxFret; fret++) {
    if (isNoteInScale(arm[lowStringIndex][fret], scale)) {
      frets.push(fret);
    }
  }
  return frets;
}

function computePositionNotes(scale, arm, strings, posFret, fretCount) {
  const lowStringIdx = strings - 1;

  // Find which scale degree sits at posFret on the low string
  let startDegree = -1;
  const posNote = arm[lowStringIdx][posFret];
  for (let i = 0; i < scale.length; i++) {
    if (notesMatch(posNote, scale[i])) {
      startDegree = i;
      break;
    }
  }
  if (startDegree === -1) return [];

  const cells = [];
  let currentDegree = startDegree;
  let refFret = posFret;

  // Walk strings from low to high (arm indices high→0)
  for (let s = lowStringIdx; s >= 0; s--) {
    const stringCells = [];

    for (let n = 0; n < 3; n++) {
      const degIdx = (currentDegree + n) % scale.length;
      const targetNote = scale[degIdx];
      // First note on the string: search from near refFret
      // Subsequent notes: search above the previous note on this string
      const prev = n > 0 ? stringCells[n - 1] : null;
      if (n > 0 && !prev) break; // previous note wasn't found, skip rest
      const minFret = n === 0
        ? Math.max(0, refFret - 1)
        : prev.fret + 1;

      for (let fret = minFret; fret <= fretCount; fret++) {
        const note = arm[s][fret];
        if (notesMatch(note, targetNote)) {
          stringCells.push({ string: s, fret, degreeIndex: degIdx });
          break;
        }
      }
    }

    cells.push(...stringCells);
    if (stringCells.length > 0) {
      refFret = stringCells[0].fret;
    }
    currentDegree += 3;
  }

  return cells;
}

function renderPositionFretboards(scale, rootNote, tuning, fretCount, degreeLabels) {
  const container = document.getElementById("scalePositions");
  container.innerHTML = "";

  const positionFrets = getPositionFrets(scale, tuning, fretCount);
  const arm = generateArmMatrix(tuning, fretCount);
  const reversedTuning = [...tuning].reverse();
  const strings = tuning.length;

  for (const posFret of positionFrets) {
    const cells = computePositionNotes(scale, arm, strings, posFret, fretCount);
    if (cells.length === 0) continue;

    // Derive fret range from actual note positions
    const allFrets = cells.map((c) => c.fret);
    const minFret = Math.min(...allFrets);
    const maxFret = Math.max(...allFrets);

    // Build lookup: "string-fret" → degreeIndex
    const cellMap = new Map();
    for (const c of cells) {
      cellMap.set(`${c.string}-${c.fret}`, c.degreeIndex);
    }

    const board = document.createElement("div");
    board.className = "position-board";

    const heading = document.createElement("h3");
    heading.className = "position-heading";
    const lowNote = arm[tuning.length - 1][posFret];
    heading.textContent = `Fret ${posFret} — ${lowNote}`;
    board.appendChild(heading);

    const wrapper = document.createElement("div");
    wrapper.className = "position-fretboard";

    const table = document.createElement("table");
    table.className = "fretboard-table";

    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th"));
    for (let fret = minFret; fret <= maxFret; fret++) {
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
      stringCell.textContent = reversedTuning[string];
      stringCell.className = "string-label";
      row.appendChild(stringCell);

      for (let fret = minFret; fret <= maxFret; fret++) {
        const cell = document.createElement("td");
        const note = arm[string][fret];
        cell.className = "fret-cell";

        const key = `${string}-${fret}`;
        if (cellMap.has(key)) {
          const degIdx = cellMap.get(key);
          const label = degreeLabels ? degreeLabels[degIdx] : degIdx + 1;
          cell.innerHTML = `<span class="note-badge"><span class="note-name">${note}</span><span class="degree-number">${label}</span></span>`;
          if (normalizeNote(note) === normalizeNote(rootNote) || note === rootNote) {
            cell.className += " root-note";
          } else {
            cell.className += " note-in-scale";
          }
        }

        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    wrapper.appendChild(table);
    board.appendChild(wrapper);
    container.appendChild(board);
  }
}

const dotFrets = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const doubleDotFrets = new Set([12, 24]);

function renderFretboard(scale, rootNote, tuning, fretCount, degreeLabels) {
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
    stringCell.textContent = `${n}${i18next.t("stringOrdinal", { count: n, ordinal: true })} (${reversedTuning[string]})`;
    stringCell.className = "string-label";
    row.appendChild(stringCell);

    for (let fret = 1; fret <= fretCount; fret++) {
      const cell = document.createElement("td");
      const note = arm[string][fret];
      cell.className = "fret-cell";

      const degree = getScaleDegree(note, scale);
      if (degree !== null) {
        const label = degreeLabels ? degreeLabels[degree - 1] : degree;
        cell.innerHTML = `<span class="note-badge"><span class="note-name">${note}</span><span class="degree-number">${label}</span></span>`;
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
  let degreeLabels;
  if (chromaticScales[selectedMode]) {
    scale = generateChromaticScale(chromaticScales[selectedMode], selectedNote);
  } else if (pentatonics[selectedMode]) {
    const penta = pentatonics[selectedMode];
    const fullScale = generateScale(penta.parent, selectedNote);
    scale = penta.degrees.map((d) => fullScale[d - 1]);
    degreeLabels = penta.degrees;
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

  renderFretboard(scale, selectedNote, tuning, fretCount, degreeLabels);

  const greekModes = ["jonio", "dorico", "frigio", "lidio", "mixolidio", "eolio", "locrio"];
  const posContainer = document.getElementById("scalePositions");
  if (greekModes.includes(selectedMode)) {
    renderPositionFretboards(scale, selectedNote, tuning, fretCount, degreeLabels);
  } else {
    posContainer.innerHTML = "";
  }
}

function initTuningControls() {
  buildStringControls(tuningPresets.standard);

  document.getElementById("tuningPreset").addEventListener("change", (e) => {
    const preset = e.target.value;
    if (preset === "custom") return;
    buildStringControls(tuningPresets[preset]);
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

  setLanguage(i18next.language);

  document
    .getElementById("noteSelect")
    .addEventListener("change", updateFretboard);
  document
    .getElementById("modeSelect")
    .addEventListener("change", updateFretboard);
});
