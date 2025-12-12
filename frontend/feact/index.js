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
let effects = [];
let stateIndex = 0;
let effectIndex = 0;

const useState = (initialState) => {
  const currentIndex = stateIndex;

  if (state[currentIndex] === undefined) {
    state[currentIndex] = initialState;
  }

  const setState = (newState) => {
    state[currentIndex] = newState;
    stateIndex = 0;
    effectIndex = 0;
    reRender();
  };

  stateIndex++;
  return [state[currentIndex], setState];
};

const useEffect = (callback, dependencies) => {
  const currentIndex = effectIndex;
  const hasNoDeps = !dependencies;
  const prevEffect = effects[currentIndex];
  const hasChangedDeps = prevEffect
    ? !dependencies.every((dep, i) => dep === prevEffect.dependencies[i])
    : true;

  if (hasNoDeps || hasChangedDeps) {
    effects[currentIndex] = {
      callback,
      dependencies,
    };
  }

  effectIndex++;
};

const Feact = {
  createElement,
  render,
};

/** @jsx Feact.createElement */
function Header() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Component mounted!");
  }, []);

  useEffect(() => {
    console.log("Count changed to:", count);
    document.title = `Count: ${count}`;
  }, [count]);

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

const runEffects = () => {
  effects.forEach((effect) => {
    if (effect && effect.callback) {
      effect.callback();
    }
  });
};

render(element, container);
runEffects();

const reRender = () => {
  container.innerHTML = "";
  stateIndex = 0;
  effectIndex = 0;
  render(element, container);
  runEffects();
};
