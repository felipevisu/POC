import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import JobApplicationFormMaterial from "./FormMaterial";
import JobApplicationFormChakra from "./FormChakra";

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/" element={<JobApplicationFormMaterial />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
