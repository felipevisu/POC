import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CartProvider } from "./store/cartStore.tsx";
import App from "./App.tsx";

import { ProductProvider } from "./store/productStore.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartProvider>
      <ProductProvider>
        <App />
      </ProductProvider>
    </CartProvider>
  </StrictMode>
);
