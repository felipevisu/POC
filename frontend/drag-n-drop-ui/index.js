const graph = {
  nodes: [],
};

document.querySelectorAll("#elements .element").forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("type", item.dataset.type);
    e.dataTransfer.setData("label", item.dataset.label);
  });
});

const canvas = document.getElementById("canvas");

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  const nodeWidth = 160;
  const nodeHeight = 48;

  const x = e.offsetX - nodeWidth / 2;
  const y = e.offsetY - nodeHeight / 2;
  const type = e.dataTransfer.getData("type");
  const label = e.dataTransfer.getData("label");
  addNode(type, label, { x, y });
});

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

function renderNode(node) {
  const nodeElement = document.createElement("div");
  nodeElement.classList.add("node");
  nodeElement.innerText = node.label;
  nodeElement.dataset.id = node.id;
  nodeElement.style.left = node.position.x + "px";
  nodeElement.style.top = node.position.y + "px";
  enableDragging(nodeElement);
  canvas.appendChild(nodeElement);
}

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

function deleteNode(id) {
  graph.nodes = graph.nodes.filter((node) => node.id !== id);
}

function updateNode(id, position) {
  const node = graph.nodes.find((node) => node.id === id);
  node.position = position;
}
