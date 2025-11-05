import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ShoppingCart from "./ShoppingCart.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ShoppingCart />
  </StrictMode>
);
