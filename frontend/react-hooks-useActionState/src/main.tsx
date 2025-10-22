import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./Basic.tsx";
import ShoppingCart from "./ShoppingCart.tsx";
import ProfilePage from "./Advanced.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProfilePage />
    <App />
    <ShoppingCart />
  </StrictMode>
);
