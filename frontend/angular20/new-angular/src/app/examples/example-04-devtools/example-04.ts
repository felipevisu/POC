import { Component, OnDestroy, signal } from '@angular/core';
import { enableProfiling } from '@angular/core';

@Component({
  selector: 'app-example-04',
  templateUrl: './example-04.html',
  styleUrl: './example-04.css'
})
export class Example04Devtools implements OnDestroy {
  // enableProfiling() makes Angular emit change-detection & render timings as a
  // custom track in Chrome's Performance panel (via console.timeStamp).
  protected readonly profiling = signal(false);
  protected readonly running = signal(false);

  // A list re-rendered every animation frame to create recordable CD/render work.
  protected readonly rows = signal<number[]>(Array.from({ length: 200 }, (_, i) => i));

  private rafId = 0;
  private frames = 0;

  // enableProfiling() is the public API; there is no public disable, so this is
  // one-way for the session. Reload the page to stop emitting profiler marks.
  enable() {
    if (this.profiling()) return;
    enableProfiling();
    this.profiling.set(true);
  }

  // Churn ~120 frames (~2s): each frame shuffles the signal → CD + re-render.
  churn() {
    if (this.running()) return;
    this.running.set(true);
    this.frames = 0;
    const step = () => {
      this.rows.update((r) => r.map((n) => (n + 1) % 1000));
      if (++this.frames < 120) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.running.set(false);
      }
    };
    this.rafId = requestAnimationFrame(step);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
  }
}
