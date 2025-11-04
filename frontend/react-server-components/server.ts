import express from "express";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import App from "./src/App"; // Remove .js extension

const app = express();

app.get("/", (req, res) => {
  const html = renderToString(createElement(App));
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>React SSR</title>
      </head>
      <body>
        <div id="root">${html}</div>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
