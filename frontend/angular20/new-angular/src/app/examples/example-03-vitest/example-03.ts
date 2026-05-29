import { Component, computed, signal } from '@angular/core';
import { add, isEven } from './calc';

@Component({
  selector: 'app-example-03',
  templateUrl: './example-03.html',
  styleUrl: './example-03.css'
})
export class Example03Vitest {
  protected readonly a = signal(2);
  protected readonly b = signal(3);

  // Same pure functions the Vitest specs cover.
  protected readonly sum = computed(() => add(this.a(), this.b()));
  protected readonly sumIsEven = computed(() => isEven(this.sum()));

  set(field: 'a' | 'b', value: string) {
    const n = Number(value) || 0;
    (field === 'a' ? this.a : this.b).set(n);
  }
}
