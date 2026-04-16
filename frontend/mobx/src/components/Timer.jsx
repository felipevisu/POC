import { observer } from "mobx-react-lite";
import { timerStore } from "../stores/TimerStore.js";

export const Timer = observer(() => {
  return (
    <div>
      <h2>Timer</h2>
      <div className="timer-display">{timerStore.formatted}</div>
      <div className="timer-controls">
        {!timerStore.running ? (
          <button onClick={() => timerStore.start()}>Start</button>
        ) : (
          <button onClick={() => timerStore.stop()}>Stop</button>
        )}
        <button onClick={() => timerStore.reset()}>Reset</button>
      </div>
    </div>
  );
});
