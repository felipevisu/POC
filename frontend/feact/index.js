const myFirstElement = {
  type: "H1",
  props: {
    title: "header",
    children: "Feact - React By Felipe Faria",
  },
};

const root = document.querySelector("#root");

const node = document.createElement(myFirstElement.type);
node.title = myFirstElement.props.title;
const text = document.createTextNode("");
text.nodeValue = myFirstElement.props.children;

node.appendChild(text);

root.appendChild(node);
