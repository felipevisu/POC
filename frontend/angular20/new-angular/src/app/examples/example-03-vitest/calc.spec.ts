import { describe, expect, it } from 'vitest';
import { add, isEven } from './calc';

// Vitest spec (experimental builder @angular/build:unit-test, runner: vitest).
// Run with: ng test  — jsdom env, watch mode, Jest-compatible expect API.
describe('calc', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('detects even numbers', () => {
    expect(isEven(4)).toBe(true);
    expect(isEven(7)).toBe(false);
  });
});
