import { useEffect } from "react";
import { useProductStore } from "./store/productStore";
import { useCartStore } from "./store/cartStore";
import { Cart } from "./components/Cart";

const sampleProducts = [
  { id: "1", name: "Shirt", price: 25, category: "Clothing" },
  { id: "2", name: "Shoes", price: 80, category: "Footwear" },
  { id: "3", name: "Hat", price: 15, category: "Accessories" },
];

function App() {
  const { setProducts, setCategory, setSort, filteredProducts } =
    useProductStore();
  const { addToCart } = useCartStore((state) => state);

  useEffect(() => {
    setProducts(sampleProducts);
  }, []);

  const products = filteredProducts();

  return (
    <>
      <div>
        <h3>Products List</h3>
        <div>
          <button onClick={() => setCategory(null)}>All</button>
          <button onClick={() => setCategory("Clothing")}>Clothing</button>
          <button onClick={() => setSort("price-asc")}>Price ↑</button>
          <button onClick={() => setSort("price-desc")}>Price ↓</button>
        </div>
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} - ${p.price}
              <button onClick={() => addToCart(p)}>Add</button>
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <Cart />
    </>
  );
}

export default App;
