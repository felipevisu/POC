import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
    title: 'Angular 21 Examples'
  },
  {
    path: 'example-1',
    loadComponent: () =>
      import('./examples/example-01-signal-forms/example-01').then((m) => m.Example01SignalForms),
    title: 'Example 1 — Signal Forms'
  }
];
