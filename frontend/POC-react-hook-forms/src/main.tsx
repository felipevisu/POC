import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./ProductForm.tsx";
import { Inputs } from "./Form.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App addProduct={(data: Inputs) => console.log(data)} />
  </StrictMode>
);
