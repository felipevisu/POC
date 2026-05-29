import { Component, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-example-02',
  templateUrl: './example-02.html',
  styleUrl: './example-02.css'
})
export class Example02Zoneless implements OnDestroy {
  // Signal: writing to it notifies Angular's scheduler → view re-renders,
  // even from an async callback, with NO Zone.js involved.
  protected readonly signalTicks = signal(0);

  // Plain field: mutating it from an async callback does NOT schedule change
  // detection in a zoneless app (Zone.js is gone, so async isn't patched).
  // The template binding stays frozen until something else triggers CD.
  protected plainTicks = 0;

  private readonly timer = setInterval(() => {
    this.signalTicks.update((n) => n + 1);
    this.plainTicks++; // changes underneath, but the view won't notice
  }, 1000);

  // Template event handler. In zoneless, handling a bound DOM event schedules
  // CD — so clicking this makes the (already-mutated) plainTicks "catch up".
  refresh() {}

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
