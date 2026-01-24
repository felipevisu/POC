import { Routes, Route } from "react-router";
import BlogItem from "./BlogItem";
import Nav from "./Nav";

function App() {
  return (
    <>
      <Nav />
      <hr />
      <Routes>
        <Route index path="/" element={<div>Home</div>} />
        <Route path="/about" element={<div>About</div>} />
        <Route path="/blog">
          <Route index element={<div>Blog</div>} />
          <Route path=":slug" element={<BlogItem />} />
        </Route>
        <Route path="/contact" element={<div>Contact</div>} />
      </Routes>
    </>
  );
}

export default App;
