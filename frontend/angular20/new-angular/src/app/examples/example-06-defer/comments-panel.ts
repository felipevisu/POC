import { Component, signal } from '@angular/core';

// A "heavy" standalone child. Because it is used ONLY inside an @defer block,
// the compiler splits it into its own chunk that loads on the defer trigger.
@Component({
  selector: 'app-comments-panel',
  template: `
    <div class="panel">
      <strong>Comments ({{ comments().length }})</strong>
      <ul>
        @for (c of comments(); track c.id) {
          <li><b>{{ c.user }}</b>: {{ c.text }}</li>
        } @empty {
          <li class="empty">No comments yet.</li>
        }
      </ul>
    </div>
  `,
  styles: [`
    .panel { padding: .75rem 1rem; border: 1px solid #cfe; border-radius: 10px; background: #f3fbf6; }
    ul { margin: .5rem 0 0; padding-left: 1.1rem; }
    li { margin: .2rem 0; }
    .empty { list-style: none; color: #888; }
  `]
})
export class CommentsPanel {
  protected readonly comments = signal([
    { id: 1, user: 'ana', text: 'Loaded only when this block triggered.' },
    { id: 2, user: 'bob', text: 'Its JS chunk was split out by @defer.' },
    { id: 3, user: 'cleo', text: '@for tracks by id; @empty handles the empty case.' }
  ]);
}
