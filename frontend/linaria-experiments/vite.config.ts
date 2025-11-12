import { defineConfig } from "vite";
import wyw from "@wyw-in-js/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [wyw(), react()],
});
