import { lazy, Suspense, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { sampleProducts } from "./fixtures";

const ProductList = lazy(() => import("product_list/ProductList"));
const useProductStore = lazy(() => import("product_list/useProductStore"));
const ProductForm = lazy(() => import("product_form/ProductForm"));

type Product = Record<string, string | number | boolean>;

export default function App() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const navigate = useNavigate();

  const addProduct = (product: Product) => {
    setProducts([product, ...products]);
    navigate("/");
  };

  console.log(useProductStore());

  return (
    <>
      <div className="menu">
        <div className="item">
          <Link to="/">Home</Link>
        </div>
        <div className="item">
          <Link to="/add">Add new product</Link>
        </div>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback="Loading...">
              <ProductList products={products} />
            </Suspense>
          }
        />
        <Route
          path="/add"
          element={
            <Suspense fallback="Loading...">
              <ProductForm addProduct={addProduct} />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}
