import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "product_list",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductList": "./src/ProductList.tsx",
        "./useProductStore": "./src/store/productStore.tsx",
      },
      remotes: {
        product_form: "http://localhost:5002/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
