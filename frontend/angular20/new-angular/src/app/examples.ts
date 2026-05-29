// Registry of examples. Add an entry here when you add a new example.
export interface ExampleMeta {
  path: string;
  number: number;
  title: string;
  description: string;
}

export const EXAMPLES: ExampleMeta[] = [
  {
    path: 'example-1',
    number: 1,
    title: 'httpResource',
    description: 'Declarative, signal-based HTTP. Reactive url auto-refetches; loading/error/value are signals.'
  },
  {
    path: 'example-2',
    number: 2,
    title: 'Zoneless change detection',
    description: 'App runs with no Zone.js via provideZonelessChangeDetection(). Signals drive rendering.'
  },
  {
    path: 'example-3',
    number: 3,
    title: 'Vitest (experimental)',
    description: 'Vite-powered unit tests via @angular/build:unit-test. jsdom env, watch mode, no Karma.'
  },
  {
    path: 'example-4',
    number: 4,
    title: 'Chrome DevTools integration',
    description: 'enableProfiling() emits CD & render timings to the browser Performance panel as an Angular track.'
  },
  {
    path: 'example-5',
    number: 5,
    title: 'Signals deep-dive',
    description: 'signal / computed / effect / linkedSignal / resource — the reactive core, live.'
  },
  {
    path: 'example-6',
    number: 6,
    title: 'Control flow & @defer',
    description: '@if / @for / @switch built-in syntax + @defer lazy block with placeholder/loading/error.'
  }
];
