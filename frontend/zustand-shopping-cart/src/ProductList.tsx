import { lazy } from "react";
import { Cart } from "./components/Cart";
import { Filters } from "./components/Filters";
import { Products } from "./components/Products";
import { CartProvider } from "./store/cartStore";
import { ProductProvider } from "./store/productStore";

const ProductForm = lazy(() => import("product_form/ProductForm"));

function ProductList() {
  return (
    <CartProvider>
      <ProductProvider>
        <Filters />
        <Products />
        <Cart />
        <ProductForm />
      </ProductProvider>
    </CartProvider>
  );
}

export default ProductList;
