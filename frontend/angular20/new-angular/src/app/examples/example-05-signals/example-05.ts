import { Component, computed, effect, linkedSignal, resource, signal } from '@angular/core';

interface User {
  id: number;
  name: string;
  username: string;
}

@Component({
  selector: 'app-example-05',
  templateUrl: './example-05.html',
  styleUrl: './example-05.css'
})
export class Example05Signals {
  // signal: writable reactive state.
  protected readonly count = signal(1);

  // computed: derived, cached, recomputes only when a dependency changes.
  protected readonly double = computed(() => this.count() * 2);
  protected readonly parity = computed(() => (this.count() % 2 === 0 ? 'even' : 'odd'));

  // linkedSignal: writable like a signal, but RESETS to its source whenever the
  // source changes. Edit the note freely; bumping count overwrites it again.
  protected readonly note = linkedSignal(() => `count is ${this.count()}`);

  // effect: runs a side effect whenever its tracked deps change. Here it appends
  // to a log signal (writes are allowed in effects). We don't READ log inside,
  // so there's no feedback loop.
  protected readonly log = signal<string[]>([]);
  constructor() {
    effect(() => {
      const c = this.count();
      this.log.update((l) => [`count → ${c}`, ...l].slice(0, 6));
    });
  }

  // resource: async state as signals — the same engine behind httpResource.
  // params() is reactive; changing count() refetches. Exposes value/isLoading/error.
  protected readonly user = resource<User, { id: number }>({
    params: () => ({ id: this.count() }),
    loader: async ({ params }) => {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${params.id}`);
      return (await res.json()) as User;
    }
  });

  inc() {
    this.count.update((n) => Math.min(10, n + 1));
  }

  dec() {
    this.count.update((n) => Math.max(1, n - 1));
  }
}
