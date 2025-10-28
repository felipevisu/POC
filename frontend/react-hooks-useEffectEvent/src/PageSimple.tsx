import { useRef, useEffect } from "react";
import type { Page } from "./types";

function PageSimple({ productId, userId, logMessage }: Page) {
  const logMessageRef = useRef(logMessage);

  useEffect(() => {
    logMessageRef.current = logMessage;
  }, [logMessage]);

  useEffect(() => {
    console.log(productId, userId, logMessageRef.current);
  }, [productId, userId]);

  return (
    <div>
      <p>Product ID: {productId}</p>
      <p>User ID: {userId}</p>
    </div>
  );
}

export default PageSimple;
