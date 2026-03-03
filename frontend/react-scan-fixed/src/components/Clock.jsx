import { useClock } from "../providers/ClockContext";
import "./Clock.css";

function Clock() {
  const { lastUpdated } = useClock()
  return (
    <span className="clock">
      {lastUpdated.toLocaleTimeString()}
    </span>
  );
}

export default Clock;