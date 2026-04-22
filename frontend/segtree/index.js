// Segment tree visualizer — range sum, point update.
// State is the source of truth. Step generators record steps without
// mutating state (except build, which we rewind before playback).
// applyStep mutates state during playback.

const SVG_NS = 'http://www.w3.org/2000/svg';

const NODE_W = 72;
const NODE_H = 44;
const ROW_H  = 90;
const CELL_W = 80;          // shared with array-view cells
const PAD_X  = 24;
const PAD_Y  = 24;

let state = null;           // { n, arr, tree, nodeInfo }
let nodes = [];             // [{ id, l, r, depth, x, y }]
let allSteps = [];
let currentStep = -1;
let highlights = {};        // id -> css class
let arrayRange = null;      // { l, r } highlight on the array view
let touchedIdx = null;      // index being updated
let log = [];
let playing = false;
let playTimer = null;

// ---------- algorithm: step generators ----------

function makeState(arr) {
  return {
    n: arr.length,
    arr: [...arr],
    tree: new Array(4 * arr.length).fill(null),
    nodeInfo: {},
  };
}

function buildSteps(s) {
  const steps = [];
  const go = (id, l, r, depth) => {
    s.nodeInfo[id] = { l, r, depth };
    steps.push({ type: 'visit', id, l, r });
    if (l === r) {
      const v = s.arr[l];
      s.tree[id] = v;
      steps.push({ type: 'leaf', id, l, value: v });
      return v;
    }
    const mid = (l + r) >> 1;
    const L = go(2 * id,     l,       mid, depth + 1);
    const R = go(2 * id + 1, mid + 1, r,   depth + 1);
    const v = L + R;
    s.tree[id] = v;
    steps.push({ type: 'merge', id, value: v, left: L, right: R });
    return v;
  };
  go(1, 0, s.n - 1, 0);
  return steps;
}

function querySteps(s, ql, qr) {
  const steps = [];
  const go = (id, l, r) => {
    steps.push({ type: 'enter-q', id, l, r, ql, qr });
    if (qr < l || r < ql) {
      steps.push({ type: 'none', id });
      return 0;
    }
    if (ql <= l && r <= qr) {
      const v = s.tree[id];
      steps.push({ type: 'full', id, value: v });
      return v;
    }
    steps.push({ type: 'partial', id });
    const mid = (l + r) >> 1;
    const L = go(2 * id,     l,       mid);
    const R = go(2 * id + 1, mid + 1, r);
    const v = L + R;
    steps.push({ type: 'combine', id, value: v, left: L, right: R });
    return v;
  };
  const total = go(1, 0, s.n - 1);
  steps.push({ type: 'done-q', total, ql, qr });
  return steps;
}

function updateSteps(s, idx, val) {
  // Pure: does not mutate s. Playback mutates.
  const steps = [];
  const go = (id, l, r) => {
    steps.push({ type: 'enter-u', id, l, r, i: idx });
    if (l === r) {
      steps.push({ type: 'set-leaf', id, old: s.tree[id], value: val, arrIndex: idx });
      return val;
    }
    const mid = (l + r) >> 1;
    let L, R;
    if (idx <= mid) {
      L = go(2 * id, l, mid);
      R = s.tree[2 * id + 1];
    } else {
      L = s.tree[2 * id];
      R = go(2 * id + 1, mid + 1, r);
    }
    const newVal = L + R;
    steps.push({ type: 'refresh', id, old: s.tree[id], value: newVal });
    return newVal;
  };
  go(1, 0, s.n - 1);
  steps.push({ type: 'done-u', i: idx, value: val });
  return steps;
}

// ---------- layout ----------

function layout() {
  nodes = [];
  for (const id in state.nodeInfo) {
    const { l, r, depth } = state.nodeInfo[id];
    const x = PAD_X + ((l + r + 1) / 2) * CELL_W;
    const y = PAD_Y + NODE_H / 2 + depth * ROW_H;
    nodes.push({ id: +id, l, r, depth, x, y });
  }
}

// ---------- rendering ----------

function renderArray() {
  const view = document.getElementById('array-view');
  view.innerHTML = '';
  view.style.paddingLeft = PAD_X + 'px';
  for (let i = 0; i < state.n; i++) {
    const d = document.createElement('div');
    d.className = 'cell';
    d.style.minWidth = (CELL_W - 4) + 'px';
    d.style.width    = (CELL_W - 4) + 'px';
    if (arrayRange && i >= arrayRange.l && i <= arrayRange.r) d.classList.add('in-range');
    if (touchedIdx === i) d.classList.add('touched');
    d.innerHTML = `<span class="idx">${i}</span>${state.arr[i]}`;
    view.appendChild(d);
  }
}

function renderTree() {
  const svg = document.getElementById('tree-svg');
  svg.innerHTML = '';
  if (nodes.length === 0) return;

  const width  = PAD_X * 2 + state.n * CELL_W;
  const maxDepth = Math.max(...nodes.map(n => n.depth));
  const height = PAD_Y * 2 + maxDepth * ROW_H + NODE_H;
  svg.setAttribute('width',  width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  // links first so nodes draw on top
  for (const n of nodes) {
    for (const cid of [2 * n.id, 2 * n.id + 1]) {
      const c = byId[cid];
      if (!c) continue;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', n.x);
      line.setAttribute('y1', n.y + NODE_H / 2);
      line.setAttribute('x2', c.x);
      line.setAttribute('y2', c.y - NODE_H / 2);
      line.setAttribute('class', 'link');
      svg.appendChild(line);
    }
  }

  for (const n of nodes) {
    const g = document.createElementNS(SVG_NS, 'g');

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', n.x - NODE_W / 2);
    rect.setAttribute('y', n.y - NODE_H / 2);
    rect.setAttribute('width',  NODE_W);
    rect.setAttribute('height', NODE_H);
    rect.setAttribute('rx', 6);
    rect.setAttribute('class', 'node-rect ' + (highlights[n.id] || ''));
    g.appendChild(rect);

    const rng = document.createElementNS(SVG_NS, 'text');
    rng.setAttribute('x', n.x);
    rng.setAttribute('y', n.y - 4);
    rng.setAttribute('text-anchor', 'middle');
    rng.setAttribute('class', 'node-range');
    rng.textContent = n.l === n.r ? `[${n.l}]` : `[${n.l},${n.r}]`;
    g.appendChild(rng);

    const val = document.createElementNS(SVG_NS, 'text');
    val.setAttribute('x', n.x);
    val.setAttribute('y', n.y + 14);
    val.setAttribute('text-anchor', 'middle');
    val.setAttribute('class', 'node-value');
    val.textContent = state.tree[n.id] == null ? '·' : state.tree[n.id];
    g.appendChild(val);

    const idT = document.createElementNS(SVG_NS, 'text');
    idT.setAttribute('x', n.x + NODE_W / 2 - 4);
    idT.setAttribute('y', n.y - NODE_H / 2 + 10);
    idT.setAttribute('text-anchor', 'end');
    idT.setAttribute('class', 'node-id');
    idT.textContent = '#' + n.id;
    g.appendChild(idT);

    svg.appendChild(g);
  }
}

function renderLog() {
  const el = document.getElementById('log');
  el.innerHTML = '';
  log.forEach((entry, i) => {
    const d = document.createElement('div');
    d.className = 'log-entry' + (i === log.length - 1 ? ' current' : '');
    d.innerHTML = `<span class="kind">${entry.kind}</span>${entry.text}`;
    el.appendChild(d);
  });
  el.scrollTop = el.scrollHeight;
}

function render() {
  renderArray();
  renderTree();
  renderLog();
}

// ---------- playback ----------

function clearHighlights() {
  highlights = {};
}

function say(kind, text) {
  log.push({ kind, text });
}

function applyStep(step) {
  clearHighlights();
  switch (step.type) {
    case 'visit':
      highlights[step.id] = 'visit';
      arrayRange = { l: step.l, r: step.r };
      say('build',  `visit #${step.id} → range [${step.l}, ${step.r}]`);
      break;
    case 'leaf':
      highlights[step.id] = 'active';
      state.tree[step.id] = step.value;
      say('build',  `leaf  #${step.id} ← arr[${step.l}] = ${step.value}`);
      break;
    case 'merge':
      highlights[step.id] = 'active';
      state.tree[step.id] = step.value;
      say('build',  `merge #${step.id} = ${step.left} + ${step.right} = ${step.value}`);
      break;

    case 'enter-q':
      highlights[step.id] = 'visit';
      say('query',  `#${step.id} covers [${step.l}, ${step.r}] vs query [${step.ql}, ${step.qr}]`);
      break;
    case 'none':
      highlights[step.id] = 'none';
      say('query',  `#${step.id} disjoint from query → 0`);
      break;
    case 'full':
      highlights[step.id] = 'full';
      say('query',  `#${step.id} fully inside query → contribute ${step.value}`);
      break;
    case 'partial':
      highlights[step.id] = 'partial';
      say('query',  `#${step.id} partial overlap → recurse into children`);
      break;
    case 'combine':
      highlights[step.id] = 'active';
      say('query',  `#${step.id} combine children ${step.left} + ${step.right} = ${step.value}`);
      break;
    case 'done-q':
      arrayRange = { l: step.ql, r: step.qr };
      say('result', `sum over [${step.ql}, ${step.qr}] = ${step.total}`);
      break;

    case 'enter-u':
      highlights[step.id] = 'visit';
      touchedIdx = step.i;
      say('update', `#${step.id} [${step.l}, ${step.r}] — descending toward index ${step.i}`);
      break;
    case 'set-leaf':
      highlights[step.id] = 'update';
      state.tree[step.id] = step.value;
      state.arr[step.arrIndex] = step.value;
      say('update', `leaf #${step.id}: ${step.old} → ${step.value}`);
      break;
    case 'refresh':
      highlights[step.id] = 'update';
      state.tree[step.id] = step.value;
      say('update', `refresh #${step.id}: ${step.old} → ${step.value}`);
      break;
    case 'done-u':
      touchedIdx = null;
      say('result', `arr[${step.i}] is now ${step.value}`);
      break;
  }
}

function stepForward() {
  if (currentStep + 1 >= allSteps.length) return false;
  currentStep++;
  applyStep(allSteps[currentStep]);
  render();
  return true;
}

function snapToEnd() {
  while (currentStep + 1 < allSteps.length) {
    currentStep++;
    applyStep(allSteps[currentStep]);
  }
  render();
}

function play() {
  if (playing) return;
  playing = true;
  document.getElementById('play-btn').textContent = 'Pause ⏸';
  const tick = () => {
    if (!playing) return;
    if (!stepForward()) { stopPlay(); return; }
    const speed = +document.getElementById('speed').value;
    playTimer = setTimeout(tick, 1600 - speed);
  };
  tick();
}

function stopPlay() {
  playing = false;
  clearTimeout(playTimer);
  document.getElementById('play-btn').textContent = 'Play ▶';
}

function queueSteps(steps, headline) {
  allSteps = steps;
  currentStep = -1;
  log = [];
  clearHighlights();
  arrayRange = null;
  touchedIdx = null;
  say('info', headline);
  render();
}

// ---------- user actions ----------

function parseArrayInput() {
  return document
    .getElementById('arr-input')
    .value.split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(x => !Number.isNaN(x));
}

function doBuild() {
  stopPlay();
  const arr = parseArrayInput();
  if (arr.length === 0) { alert('Enter a non-empty array of integers.'); return; }
  if (arr.length > 32)  { alert('Keep n ≤ 32 so the tree stays readable.'); return; }
  state = makeState(arr);
  const steps = buildSteps(state);      // populates nodeInfo and tree
  state.tree = new Array(4 * state.n).fill(null); // rewind for animation
  layout();
  queueSteps(steps, `build on n=${state.n} — ${steps.length} steps`);
}

function doQuery() {
  if (!state) { alert('Build the tree first.'); return; }
  stopPlay();
  snapToEnd();
  const ql = +document.getElementById('ql').value;
  const qr = +document.getElementById('qr').value;
  if (Number.isNaN(ql) || Number.isNaN(qr) || ql < 0 || qr >= state.n || ql > qr) {
    alert(`Need 0 ≤ l ≤ r ≤ ${state.n - 1}.`);
    return;
  }
  const steps = querySteps(state, ql, qr);
  queueSteps(steps, `query sum over [${ql}, ${qr}] — ${steps.length} steps`);
  arrayRange = { l: ql, r: qr };
  render();
}

function doUpdate() {
  if (!state) { alert('Build the tree first.'); return; }
  stopPlay();
  snapToEnd();
  const i = +document.getElementById('ui').value;
  const v = +document.getElementById('uv').value;
  if (Number.isNaN(i) || Number.isNaN(v) || i < 0 || i >= state.n) {
    alert(`Index must be in [0, ${state.n - 1}].`);
    return;
  }
  const steps = updateSteps(state, i, v);
  queueSteps(steps, `update arr[${i}] = ${v} — ${steps.length} steps`);
  touchedIdx = i;
  render();
}

// ---------- wire up ----------

document.getElementById('build-btn') .addEventListener('click', doBuild);
document.getElementById('query-btn') .addEventListener('click', doQuery);
document.getElementById('update-btn').addEventListener('click', doUpdate);
document.getElementById('step-btn')  .addEventListener('click', stepForward);
document.getElementById('play-btn')  .addEventListener('click', () => (playing ? stopPlay() : play()));
document.getElementById('end-btn')   .addEventListener('click', snapToEnd);

doBuild();
