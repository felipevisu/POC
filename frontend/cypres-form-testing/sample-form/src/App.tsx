import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

// Lazy load each form to ensure isolation and better code splitting
const JobApplicationFormMaterial = lazy(() => import("./FormMaterial"));
const JobApplicationFormChakra = lazy(() => import("./FormChakra"));
const JobApplicationFormBootstrap = lazy(() => import("./FormBootstrap"));

// Loading fallback component
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "1.2rem",
    }}
  >
    Loading...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/material" element={<JobApplicationFormMaterial />} />
          <Route
            path="/chakra"
            element={
              <ChakraProvider value={defaultSystem}>
                <JobApplicationFormChakra />
              </ChakraProvider>
            }
          />
          <Route path="/bootstrap" element={<JobApplicationFormBootstrap />} />
          <Route path="/" element={<JobApplicationFormMaterial />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
