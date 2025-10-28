import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PageSimple from "./PageSimple";
import PageEnhanced from "./PageEnhanced";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PageSimple userId="123" productId="abc" logMessage="Some product page" />
    <PageEnhanced userId="123" productId="abc" logMessage="Some product page" />
  </StrictMode>
);
