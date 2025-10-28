import { useEffect, useEffectEvent } from "react";
import type { Page } from "./types";

function PageEnhanced({ productId, userId, logMessage }: Page) {
  const onVisit = useEffectEvent(() => {
    console.log(productId, userId, logMessage);
  });

  useEffect(() => {
    onVisit();
  }, [productId, userId]);

  return (
    <div>
      <p>Product ID: {productId}</p>
      <p>User ID: {userId}</p>
    </div>
  );
}

export default PageEnhanced;
