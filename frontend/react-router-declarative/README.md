# React Router - Declarative style

```tsx
function App() {
  return (
    <Routes>
      <Route index path="/" element={<div>Home</div>} />
      <Route path="/about" element={<div>About</div>} />
      <Route path="/blog">
        <Route index element={<div>Blog</div>}></Route>
        <Route path=":slug" element={<div>Blog Item</div>}></Route>
      </Route>
      <Route path="/contact" element={<div>Contact</div>} />
    </Routes>
  );
}
```
