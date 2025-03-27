import { create } from "zustand";
import { combine } from "zustand/middleware";

import "./App.css";

type SquareValue = string | null;

type GameBoardState = {
  squares: SquareValue[];
};

type GameBoardActions = {
  setSquares: (
    next: SquareValue[] | ((prev: SquareValue[]) => SquareValue[])
  ) => void;
};

type SquareProps = {
  value: SquareValue;
  onSquareClick?: () => void;
};

const useGameBoard = create<GameBoardState & GameBoardActions>(
  combine({ squares: Array(9).fill(null) }, (set) => {
    return {
      setSquares: (nextSquares) => {
        set((state) => ({
          squares:
            typeof nextSquares === "function"
              ? nextSquares(state.squares)
              : nextSquares,
        }));
      },
    };
  })
);

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function App() {
  const { squares, setSquares } = useGameBoard((state) => state);

  function handleClick(i: number) {
    if (squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = "X";
    setSquares(nextSquares);
  }

  return (
    <div className="grid">
      {squares.map((square, index) => (
        <Square
          key={index}
          value={square}
          onSquareClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}

export default App;
