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

  const isEvent = (key) => key.startsWith("on");
  const isProperty = (key) => key !== "children" && !isEvent(key);

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  Object.keys(element.props)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, element.props[name]);
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

let state = [];
let stateIndex = 0;

const useState = (initialState) => {
  const currentIndex = stateIndex;

  if (state[currentIndex] === undefined) {
    state[currentIndex] = initialState;
  }

  const setState = (newState) => {
    state[currentIndex] = newState;
    stateIndex = 0;
    reRender();
  };

  stateIndex++;
  return [state[currentIndex], setState];
};

const Feact = {
  createElement,
  render,
};

/** @jsx Feact.createElement */
function Header() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>React</h1>
      <h2>Felipe Faria React Clone</h2>
      <h3>Count: {count}</h3>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

const element = <Header />;

const container = document.getElementById("root");
render(element, container);

const reRender = () => {
  container.innerHTML = "";
  stateIndex = 0; // Reset state index before re-render
  render(element, container);
};
