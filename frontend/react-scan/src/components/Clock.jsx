import { useContext } from "react";
import { AppContext } from "../AppContext";
import "./Clock.css";

function Clock() {
  const { lastUpdated } = useContext(AppContext);
  return (
    <span className="clock">
      {lastUpdated.toLocaleTimeString()}
    </span>
  );
}

export default Clock;