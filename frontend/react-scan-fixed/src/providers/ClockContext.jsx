import { createContext, useContext } from "react";

export const ClockContext = createContext();

export function useClock() {
  return useContext(ClockContext);
}