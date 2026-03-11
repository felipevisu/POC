const graph = {
  nodes: [],
  edges: [],
};

let selectedNodeId = null;
let selectedEdgeId = null;

const svg = document.getElementById("connections");
const canvas = document.getElementById("canvas");

const NODE_WIDTH = 160;
const NODE_HEIGHT = 48;

function addNode(type, label, position) {
  const node = {
    id: crypto.randomUUID(),
    label,
    type,
    position,
  };
  graph.nodes.push(node);
  renderNode(node);
}

function renderNode(node) {
  const nodeElement = document.createElement("div");
  nodeElement.classList.add("node", node.type);
  nodeElement.innerText = node.label;
  nodeElement.dataset.id = node.id;
  nodeElement.style.left = node.position.x + "px";
  nodeElement.style.top = node.position.y + "px";

  enableDragging(nodeElement);
  enableNodeSelection(nodeElement, node);

  canvas.appendChild(nodeElement);
}

function updateNode(id, position) {
  const node = graph.nodes.find((node) => node.id === id);
  node.position = position;
  updateAllEdges();
}

function deleteNode(id) {
  graph.nodes = graph.nodes.filter((node) => node.id !== id);
}

function enableDragging(nodeElement) {
  let offsetX;
  let offsetY;

  function onMouseDown(e) {
    const rect = nodeElement.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e) {
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - offsetX;
    const y = e.clientY - canvasRect.top - offsetY;

    nodeElement.style.left = x + "px";
    nodeElement.style.top = y + "px";

    const id = nodeElement.dataset.id;
    updateNode(id, { x, y });
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  nodeElement.addEventListener("mousedown", onMouseDown);
}

function enableNodeSelection(nodeElement, node) {
  nodeElement.addEventListener("click", (e) => {
    e.stopPropagation();

    if (e.shiftKey) {
      // Shift+Click: connect nodes
      if (selectedNodeId && selectedNodeId !== node.id) {
        addEdge(selectedNodeId, node.id);
        deselectAll();
      } else {
        deselectAll();
        selectedNodeId = node.id;
        nodeElement.classList.add("selected");
      }
    } else {
      deselectAll();
      selectedNodeId = node.id;
      nodeElement.classList.add("selected");
    }
  });
}

function enableEdgeSelection(edgeElement) {
  edgeElement.addEventListener("click", (e) => {
    e.stopPropagation();
    deselectAll();
    selectedEdgeId = edgeElement.dataset.id;
    edgeElement.classList.add("selected");
  });
}

function addEdge(sourceId, targetId) {
  const edge = {
    id: crypto.randomUUID(),
    source: sourceId,
    target: targetId,
  };
  graph.edges.push(edge);
  renderEdge(edge);
}

function renderEdge(edge) {
  const edgeElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line",
  );
  edgeElement.setAttribute("id", edge.id);
  edgeElement.dataset.id = edge.id;
  updateEdgePosition(edgeElement, edge);
  enableEdgeSelection(edgeElement);
  svg.appendChild(edgeElement);
}

function updateEdgePosition(line, edge) {
  const sourceNode = graph.nodes.find((n) => n.id === edge.source);
  const targetNode = graph.nodes.find((n) => n.id === edge.target);

  if (!sourceNode || !targetNode) return;

  line.setAttribute("x1", sourceNode.position.x + NODE_WIDTH / 2);
  line.setAttribute("y1", sourceNode.position.y + NODE_HEIGHT / 2);
  line.setAttribute("x2", targetNode.position.x + NODE_WIDTH / 2);
  line.setAttribute("y2", targetNode.position.y + NODE_HEIGHT / 2);
}

function updateAllEdges() {
  graph.edges.forEach((edge) => {
    const line = svg.getElementById(edge.id);
    if (line) updateEdgePosition(line, edge);
  });
}

document.querySelectorAll("#elements .element").forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("type", item.dataset.type);
    e.dataTransfer.setData("label", item.dataset.label);
  });
});

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();

  const x = e.offsetX - NODE_WIDTH / 2;
  const y = e.offsetY - NODE_HEIGHT / 2;
  const type = e.dataTransfer.getData("type");
  const label = e.dataTransfer.getData("label");

  addNode(type, label, { x, y });
});

canvas.addEventListener("click", (e) => {
  if (e.target === canvas) {
    deselectAll();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    if (selectedNodeId) {
      deleteSelectedNode();
    } else if (selectedEdgeId) {
      deleteSelectedEdge();
    }
  }
});

function deselectAll() {
  if (selectedNodeId) {
    document
      .querySelector(`[data-id="${selectedNodeId}"]`)
      ?.classList.remove("selected");
    selectedNodeId = null;
  }
  if (selectedEdgeId) {
    svg.getElementById(selectedEdgeId)?.classList.remove("selected");
    selectedEdgeId = null;
  }
}

function deleteSelectedNode() {
  const nodeElement = document.querySelector(`[data-id="${selectedNodeId}"]`);
  if (nodeElement) nodeElement.remove();

  const connectedEdges = graph.edges.filter(
    (e) => e.source === selectedNodeId || e.target === selectedNodeId,
  );
  connectedEdges.forEach((edge) => {
    svg.getElementById(edge.id)?.remove();
  });
  graph.edges = graph.edges.filter(
    (e) => e.source !== selectedNodeId && e.target !== selectedNodeId,
  );

  graph.nodes = graph.nodes.filter((n) => n.id !== selectedNodeId);
  selectedNodeId = null;
}

function deleteSelectedEdge() {
  svg.getElementById(selectedEdgeId)?.remove();
  graph.edges = graph.edges.filter((e) => e.id !== selectedEdgeId);
  selectedEdgeId = null;
}
