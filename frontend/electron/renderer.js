const editor = document.getElementById("editor");
const lineNumbers = document.getElementById("line-numbers");
const fileName = document.getElementById("file-name");
const cursorPos = document.getElementById("cursor-pos");
const charCount = document.getElementById("char-count");
const infoPanel = document.getElementById("info-panel");
const infoGrid = document.getElementById("info-grid");

let currentFilePath = null;
let isModified = false;

function updateLineNumbers() {
  const lines = editor.value.split("\n").length;
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
}

function updateCursorPosition() {
  const text = editor.value.substring(0, editor.selectionStart);
  const line = text.split("\n").length;
  const col = text.split("\n").pop().length + 1;
  cursorPos.textContent = `Ln ${line}, Col ${col}`;
}

function updateCharCount() {
  charCount.textContent = `${editor.value.length} characters`;
}

function markModified() {
  if (!isModified) {
    isModified = true;
    fileName.classList.add("modified");
    const name = fileName.textContent.replace(" *", "");
    fileName.textContent = name + " *";
  }
}

function markSaved(path) {
  isModified = false;
  currentFilePath = path;
  fileName.classList.remove("modified");
  fileName.textContent = path.split("/").pop();
}

editor.addEventListener("input", () => {
  updateLineNumbers();
  updateCharCount();
  markModified();
});

editor.addEventListener("click", updateCursorPosition);
editor.addEventListener("keyup", updateCursorPosition);

editor.addEventListener("scroll", () => {
  lineNumbers.scrollTop = editor.scrollTop;
});

editor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + "  " + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
    updateLineNumbers();
    markModified();
  }
});

document.getElementById("btn-open").addEventListener("click", () => {
  window.electronAPI.openFile();
});

document.getElementById("btn-save").addEventListener("click", async () => {
  const saved = await window.electronAPI.saveFile({
    filePath: currentFilePath,
    content: editor.value,
  });
  if (saved) markSaved(saved);
});

document.getElementById("btn-info").addEventListener("click", async () => {
  const visible = infoPanel.style.display !== "none";
  if (visible) {
    infoPanel.style.display = "none";
    return;
  }
  const info = await window.electronAPI.getSystemInfo();
  infoGrid.innerHTML = Object.entries(info)
    .map(([key, val]) => `
      <div class="info-item">
        <span class="label">${key}</span>
        <span class="value">${val}</span>
      </div>
    `)
    .join("");
  infoPanel.style.display = "block";
});

window.electronAPI.onFileOpened(({ filePath, content }) => {
  editor.value = content;
  markSaved(filePath);
  updateLineNumbers();
  updateCharCount();
});

window.electronAPI.onTriggerSave(async () => {
  const saved = await window.electronAPI.saveFile({
    filePath: currentFilePath,
    content: editor.value,
  });
  if (saved) markSaved(saved);
});

updateLineNumbers();
