import { Activity, useState } from "react";
import Blog from "./Blog";
import Form from "./Form";

function App() {
  const [active, setActive] = useState("blog");

  return (
    <>
      <header>
        <h1>React Activity Example</h1>
        <nav>
          <button onClick={() => setActive("blog")}>Blog</button>
          <button onClick={() => setActive("contact")}>Contact</button>
        </nav>
      </header>
      <Activity mode={active === "blog" ? "visible" : "hidden"}>
        <Blog />
      </Activity>
      <Activity mode={active === "contact" ? "visible" : "hidden"}>
        <Form />
      </Activity>
    </>
  );
}

export default App;
