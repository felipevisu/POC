import { useEffect } from "react";
import { useProductStore } from "./store/productStore";
import { useCartStore } from "./store/cartStore";
import { Cart } from "./components/Cart";
import { formatToReal } from "./utils";

const sampleProducts = [
  {
    id: "1",
    name: "Dirk",
    price: 139.99,
    category: "Alien",
    image: "/products/01.png",
  },
  {
    id: "2",
    name: "Midnight Snack",
    price: 129.99,
    category: "Monster",
    image: "/products/02.png",
  },
  {
    id: "3",
    name: "Midnight Snack",
    price: 39.99,
    category: "Animal",
    image: "/products/03.png",
  },
  {
    id: "4",
    name: "Fuzzy Slim",
    price: 99.99,
    category: "Monster",
    image: "/products/04.png",
  },
  {
    id: "5",
    name: "Fox",
    price: 67.99,
    category: "Animal",
    image: "/products/05.png",
  },
  {
    id: "6",
    name: "Skarleix",
    price: 39.99,
    category: "Alien",
    image: "/products/03.png",
  },
];

const categories = ["Animal", "Alien", "Monster"];

const buttonDefault =
  "px-6 py-2 border-2 border-gray-200 rounded-full cursor-pointer font-bold hover:bg-gray-200 hover:text-black";

const buttonActive = buttonDefault + " bg-gray-200 text-black";

function App() {
  const { filters, setProducts, setCategory, setSort, filteredProducts } =
    useProductStore();
  const { addToCart } = useCartStore((state) => state);

  useEffect(() => {
    setProducts(sampleProducts);
  }, [setProducts]);

  const products = filteredProducts();

  return (
    <>
      <div className="border-b-1 border-gray-500">
        <div className="flex px-6 py-6 border-b-1 border-gray-500">
          <div className="grow-1 flex gap-4">
            <button
              className={
                filters.category === null ? buttonActive : buttonDefault
              }
              onClick={() => setCategory(null)}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                className={
                  filters.category === c ? buttonActive : buttonDefault
                }
                key={c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div>
            <button
              className={buttonDefault}
              onClick={() =>
                setSort(
                  filters.sort === null
                    ? "price-asc"
                    : filters.sort === "price-asc"
                    ? "price-desc"
                    : "price-asc"
                )
              }
            >
              {filters.sort === null || filters.sort === "price-desc"
                ? "Price ↑"
                : "Price ↓"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 p-6">
          {products.map((p) => (
            <div key={p.id} className="">
              <img src={p.image} alt={p.name} className="mb-3 rounded-md" />
              <div className="flex items-center">
                <div className="grow-1">
                  <h4 className="font-bold">{p.name}</h4>
                  <p>{formatToReal(p.price)}</p>
                </div>
                <button
                  className="cursor-pointer border border-gray-200 px-3 py-1 rounded-full"
                  onClick={() => addToCart(p)}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Cart />
    </>
  );
}

export default App;
