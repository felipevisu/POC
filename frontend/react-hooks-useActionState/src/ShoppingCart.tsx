import { useActionState } from "react";

async function addToCart(_prev: unknown, data: FormData) {
  const itemId = data.get("itemId");

  if (itemId === "abc") {
    return "Added";
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
  return "Failed";
}

function AddToCartForm({
  itemId,
  itemTitle,
}: {
  itemId: string;
  itemTitle: string;
}) {
  const [message, formAction, isPending] = useActionState(addToCart, null);
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
