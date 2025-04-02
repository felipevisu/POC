import { useCartStore } from "../store/cartStore";
import { formatToReal } from "../utils";

export const Cart = () => {
  const { items, isOpen, getTotal, removeFromCart, toggleMenu } = useCartStore(
    (state) => state
  );

  return (
    <>
      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed top-0 right-0 bottom-0 left-0 bg-black/50 backdrop-blur-sm z-30"
        />
      )}
      <aside
        id="default-sidebar"
        className={`fixed top-0 right-0 ${
          isOpen ? "translate-x-0" : "translate-x-164"
        } z-40 w-164  h-screen transition-transform`}
        aria-label="Sidebar"
      >
        <div className="h-full overflow-y-auto bg-black/95">
          <div className="h-24 flex items-center">
            <h3 className="font-bold text-xl px-6">Shopping Cart</h3>
          </div>
          <div className="p-6">
            <table className="w-full mb-6">
              <tbody>
                {items.map(({ product, quantity }) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                        width={64}
                        className="rounded"
                      />
                    </td>
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
        </div>
      </aside>
    </>
  );
};
