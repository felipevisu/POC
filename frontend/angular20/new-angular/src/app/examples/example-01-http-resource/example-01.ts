import { Component, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  company: { name: string };
}

@Component({
  selector: 'app-example-01',
  templateUrl: './example-01.html',
  styleUrl: './example-01.css'
})
export class Example01HttpResource {
  // Reactive param. Changing it auto-refetches the resource.
  protected readonly userId = signal(1);

  // httpResource: declarative HTTP backed by signals.
  // - url is a reactive computation; when userId() changes, it refetches
  // - exposes value()/isLoading()/error()/status() signals out of the box
  // - no subscribe, no manual loading/error bookkeeping
  protected readonly user = httpResource<User>(
    () => `https://jsonplaceholder.typicode.com/users/${this.userId()}`
  );

  protected readonly hasUser = computed(() => !!this.user.value());

  prev() {
    this.userId.update((id) => Math.max(1, id - 1));
  }

  next() {
    this.userId.update((id) => Math.min(10, id + 1));
  }
}
