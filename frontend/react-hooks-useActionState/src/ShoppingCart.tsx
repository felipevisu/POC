import { useActionState, useState } from "react";

function addToCart(prev, data) {
  const itemId = data.get("itemId");

  if(itemId === "abc")

}

function AddToCartForm({
  itemId,
  itemTitle,
}: {
  itemId: string;
  itemTitle: string;
}) {
  const [message, formAction, isPending] = useActionState<string>(
    addToCart,
    null
  );
  return (
    <form action={formAction}>
      <h2>{itemTitle}</h2>
      <input type="hidden" name="itemId" value={itemId} />
      <button type="submit">Add</button>
      {isPending ? "Adding" : message}
    </form>
  );
}

export default function ShoppingCart() {
  return (
    <>
      <AddToCartForm itemId="abc" itemTitle="Product 1" />
      <AddToCartForm itemId="def" itemTitle="Product 2" />
    </>
  );
}
