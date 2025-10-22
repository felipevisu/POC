import { useActionState } from "react";

async function increment(prev: number) {
  return prev + 1;
}

function App() {
  const [state, formAction] = useActionState<number>(increment, 0);

  return (
    <form action={formAction}>
      {state}
      <button type="submit">Increment</button>
    </form>
  );
}

export default App;
