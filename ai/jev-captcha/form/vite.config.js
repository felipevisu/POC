import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { submitHandler } from "./server/submit.js";

export default defineConfig(({ mode }) => {
  // The Jev key stays on the dev server; it is never sent to the browser.
  const { TYPESAFE_API_KEY } = loadEnv(mode, process.cwd(), "");
  if (!TYPESAFE_API_KEY) throw new Error("Set TYPESAFE_API_KEY in form/.env");
  return {
    plugins: [
      react(),
      { name: "jev-submit", configureServer(server) { server.middlewares.use("/api/submit", submitHandler(TYPESAFE_API_KEY)); } },
    ],
  };
});
