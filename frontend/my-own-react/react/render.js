export default function render(vnode, container) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    container.appendChild(document.createTextNode(vnode));
    return;
  }

  const el = document.createElement(vnode.type);

  for (const [key, value] of Object.entries(vnode.props)) {
    el.setAttribute(key, value);
  }

  vnode.children.forEach((child) => render(child, el));

  container.appendChild(el);
}
