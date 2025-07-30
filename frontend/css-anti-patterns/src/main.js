import "./style.scss";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

// Highlight all <pre><code>...</code></pre> blocks
document.addEventListener("DOMContentLoaded", () => {
  hljs.highlightAll();
});
