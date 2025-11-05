import { useState, useTransition } from "react";

const intl = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function updateQuantity(
  newQuantity: number,
  oldQuantity: number
): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        // API call worked
        resolve(newQuantity);
      } else {
        // API call failed
        resolve(oldQuantity);
      }
    }, 2000);
  });
}

export default function ShoppingCart() {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const updateQuantityAction = async (newQuantity: number) => {
    setQuantity(newQuantity);
    startTransition(async () => {
      const savedQuantity = await updateQuantity(newQuantity, quantity);
      setQuantity(savedQuantity);
    });
  };

  return (
    <div>
      <h1>Checkout</h1>
      <div className="item">
        <span>The Wall Tour</span>
        <label htmlFor="quantity">Quantity</label>
        <input
          type="number"
          min={1}
          defaultValue={1}
          value={quantity}
          name="quantity"
          onChange={(e) => updateQuantityAction(Number(e.target.value))}
        />
      </div>
      <hr />
      <div className="total">
        <span>Total:</span>
        <span>
          {isPending ? "🌀 Updating..." : `${intl.format(quantity * 9999)}`}
        </span>
      </div>
    </div>
  );
}
