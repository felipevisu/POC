import { useCartStore } from "../store/cartStore";

export const Cart = () => {
  const { items, addToCart, getTotal, removeFromCart } = useCartStore(
    (state) => state
  );

  return (
    <div>
      <h3>Cart</h3>
      <ul>
        {items.map(({ product, quantity }) => (
          <li key={product.id}>
            {product.name} - {quantity} - {product.price} -{" "}
            {product.price * quantity}
            <button onClick={() => removeFromCart(product.id)}>Remove</button>
          </li>
        ))}
        <p>
          Total: <b>{getTotal()}</b>
        </p>
      </ul>
    </div>
  );
};
