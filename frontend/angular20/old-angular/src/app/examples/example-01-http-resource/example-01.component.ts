import { Component, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  company: { name: string };
}

@Component({
  selector: 'app-example-01',
  templateUrl: './example-01.component.html',
  styleUrl: './example-01.component.css'
})
export class Example01Component {
  private readonly http = inject(HttpClient);

  protected readonly userId = signal(1);

  // No httpResource in Angular 19: wire it up by hand.
  // Track loading / error / value as separate signals and subscribe manually.
  protected readonly user = signal<User | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  constructor() {
    // Re-fetch whenever userId() changes — the manual equivalent of
    // httpResource's reactive url. We own subscribe + state bookkeeping.
    effect(() => {
      const id = this.userId();
      this.loading.set(true);
      this.error.set(false);
      this.http.get<User>(`https://jsonplaceholder.typicode.com/users/${id}`).subscribe({
        next: (u) => {
          this.user.set(u);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });
    });
  }

  prev() {
    this.userId.update((id) => Math.max(1, id - 1));
  }

  next() {
    this.userId.update((id) => Math.min(10, id + 1));
  }
}
