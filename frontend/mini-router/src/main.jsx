import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RouterProvider from "./router/BroswerRouter.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>,
);
