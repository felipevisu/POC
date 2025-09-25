import { useCallback, useRef, useEffect } from "react";

export interface DebounceProps<T extends unknown[]> {
  children: (debouncedFn: (...args: T) => void) => React.ReactNode;
  debounceFn: (...args: T) => void;
  delay?: number;
}

function Debounce<T extends unknown[]>({ 
  children, 
  debounceFn, 
  delay = 200 
}: DebounceProps<T>) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFunction = useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        debounceFn(...args);
      }, delay);
    },
    [debounceFn, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return children(debouncedFunction);
}

export default Debounce;