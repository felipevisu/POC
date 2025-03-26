import { create } from "zustand";

import "./App.css";

type State = {
  count: number;
};

type Actions = {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

const useStore = create<State & Actions>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set(() => ({ count: 0 })),
}));

function App() {
  const { count, increment, decrement, reset } = useStore((state) => state);

  return (
    <>
      <p>{count}</p>
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>
      <button onClick={reset}>Reset</button>
    </>
  );
}

export default App;
