import { TodoList } from "./components/TodoList.jsx";
import { Timer } from "./components/Timer.jsx";
import { Stats } from "./components/Stats.jsx";
import "./styles.css";

export function App() {
  return (
    <div className="app">
      <h1>MobX POC</h1>
      <div className="panels">
        <div className="panel">
          <TodoList />
        </div>
        <div className="panel">
          <Timer />
          <Stats />
        </div>
      </div>
    </div>
  );
}
