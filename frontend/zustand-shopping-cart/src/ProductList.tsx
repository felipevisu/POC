import { Cart } from "./components/Cart";
import { Filters } from "./components/Filters";
import { Products } from "./components/Products";
import { CartProvider } from "./store/cartStore";
import { ProductProvider } from "./store/productStore";

function ProductList() {
  return (
    <CartProvider>
      <ProductProvider>
        <Filters />
        <Products />
        <Cart />
      </ProductProvider>
    </CartProvider>
  );
}

export default ProductList;
