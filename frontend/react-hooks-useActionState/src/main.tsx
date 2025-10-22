import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./Basic.tsx";
import ShoppingCart from "./ShoppingCart.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <ShoppingCart />
  </StrictMode>
);
