import { Cart } from "./components/Cart";
import { Filters } from "./components/Filters";
import { Products } from "./components/Products";
import { CartProvider } from "./store/cartStore";
import { Product, ProductProvider } from "./store/productStore";

function ProductList({ products }: { products: Product[] }) {
  return (
    <CartProvider>
      <ProductProvider>
        <Filters />
        <Products products={products} />
        <Cart />
      </ProductProvider>
    </CartProvider>
  );
}

export default ProductList;
