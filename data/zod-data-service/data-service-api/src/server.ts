import { buildApp } from "./app.js";

const PORT = process.env.PORT || 3000;

buildApp().listen(PORT);
