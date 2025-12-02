function createTextElement(text) {
  return {
    type: "TEXT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function render(element, container) {
  if (typeof element.type === "function") {
    const component = element.type(element.props);
    return render(component, container);
  }

  const dom =
    element.type === "TEXT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== "children")
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

const Feact = {
  createElement,
  render,
};

/** @jsx Feact.createElement */
function Header() {
  return (
    <div>
      <h1>React</h1>
      <h2>Felipe Faria React Clone</h2>
    </div>
  );
}
const element = <Header />;

const container = document.getElementById("root");
render(element, container);
