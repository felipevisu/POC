import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import ProductList from "./ProductList.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProductList />
  </StrictMode>
);
