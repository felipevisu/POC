import { render, createElement } from "./react/index.js";

const App = () => {
  return createElement(
    "div",
    { id: "app" },
    createElement("h1", null, "Hello world!"),
    createElement("p", null, "My name is Felipe Faria.")
  );
};

const root = document.getElementById("root");
render(App(), root);
