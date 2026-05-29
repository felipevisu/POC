import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
    title: 'Angular 20 Examples'
  },
  {
    path: 'example-1',
    loadComponent: () =>
      import('./examples/example-01-http-resource/example-01').then((m) => m.Example01HttpResource),
    title: 'Example 1 — httpResource'
  },
  {
    path: 'example-2',
    loadComponent: () =>
      import('./examples/example-02-zoneless/example-02').then((m) => m.Example02Zoneless),
    title: 'Example 2 — Zoneless'
  },
  {
    path: 'example-3',
    loadComponent: () =>
      import('./examples/example-03-vitest/example-03').then((m) => m.Example03Vitest),
    title: 'Example 3 — Vitest'
  },
  {
    path: 'example-4',
    loadComponent: () =>
      import('./examples/example-04-devtools/example-04').then((m) => m.Example04Devtools),
    title: 'Example 4 — DevTools profiling'
  },
  {
    path: 'example-5',
    loadComponent: () =>
      import('./examples/example-05-signals/example-05').then((m) => m.Example05Signals),
    title: 'Example 5 — Signals deep-dive'
  },
  {
    path: 'example-6',
    loadComponent: () =>
      import('./examples/example-06-defer/example-06').then((m) => m.Example06Defer),
    title: 'Example 6 — Control flow & @defer'
  }
];
