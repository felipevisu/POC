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
    title: 'Signal Forms (experimental)',
    description: 'Forms built on signals: form() + schema validators, field state as signals, no FormGroup.'
  }
];
