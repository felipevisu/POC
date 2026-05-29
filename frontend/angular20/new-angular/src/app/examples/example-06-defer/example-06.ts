import { Component, signal } from '@angular/core';
import { CommentsPanel } from './comments-panel';

@Component({
  selector: 'app-example-06',
  // CommentsPanel is imported, but used only inside @defer → own lazy chunk.
  imports: [CommentsPanel],
  templateUrl: './example-06.html',
  styleUrl: './example-06.css'
})
export class Example06Defer {
  // Drives @switch / @if control-flow demo.
  protected readonly status = signal<'idle' | 'active' | 'done'>('idle');

  cycle() {
    this.status.update((s) => (s === 'idle' ? 'active' : s === 'active' ? 'done' : 'idle'));
  }
}
