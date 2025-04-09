import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      remotes: {
        product_list: "http://localhost:5001/assets/remoteEntry.js",
        product_form: "http://localhost:5002/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom"],
    }),
  ],
});
