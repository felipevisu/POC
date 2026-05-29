import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
    title: 'Angular 19 Examples'
  },
  {
    path: 'example-1',
    loadComponent: () =>
      import('./examples/example-01-http-resource/example-01.component').then(
        (m) => m.Example01Component
      ),
    title: 'Example 1 — HttpClient'
  }
];
