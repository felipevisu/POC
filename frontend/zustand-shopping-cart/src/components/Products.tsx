import { useEffect } from "react";
import { sampleProducts } from "../fixtures";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { formatToReal } from "../utils";

export const Products = () => {
  const { setProducts, filteredProducts } = useProductStore((state) => state);
  const { addToCart } = useCartStore((state) => state);

  useEffect(() => {
    setProducts(sampleProducts);
  }, [setProducts]);

  const products = filteredProducts();

  return (
    <div className="grid grid-cols-3 gap-6 p-6 border-b-1 border-gray-500">
      {products.map((p) => (
        <div key={p.id} className="">
          <img src={p.image} alt={p.name} className="mb-3 rounded-md" />
          <div className="flex items-center">
            <div className="grow-1">
              <h4 className="font-bold">{p.name}</h4>
              <p>{formatToReal(p.price)}</p>
            </div>
            <button
              className="cursor-pointer border border-gray-200 hover:bg-gray-200 hover:text-black px-3 py-1 rounded-full"
              onClick={() => addToCart(p)}
            >
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
