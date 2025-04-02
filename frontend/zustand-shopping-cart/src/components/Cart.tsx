import { useCartStore } from "../store/cartStore";
import { formatToReal } from "../utils";

export const Cart = () => {
  const { items, getTotal, removeFromCart } = useCartStore((state) => state);

  return (
    <div className="p-6">
      <h3>Cart</h3>
      <table>
        <tbody>
          {items.map(({ product, quantity }) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{quantity}</td>
              <td>{formatToReal(product.price)}</td>
              <td>{formatToReal(product.price * quantity)}</td>
              <td>
                <button onClick={() => removeFromCart(product.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Total: <b>{formatToReal(getTotal())}</b>
      </p>
    </div>
  );
};
