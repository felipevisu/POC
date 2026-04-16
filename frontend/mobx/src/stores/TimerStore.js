import { makeAutoObservable } from "mobx";

class TimerStore {
  seconds = 0;
  running = false;
  intervalId = null;

  constructor() {
    makeAutoObservable(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stop() {
    this.running = false;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  reset() {
    this.stop();
    this.seconds = 0;
  }

  tick() {
    this.seconds++;
  }

  get formatted() {
    const mins = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
}

export const timerStore = new TimerStore();
