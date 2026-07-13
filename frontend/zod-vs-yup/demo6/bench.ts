import { z } from "zod";
import * as yup from "yup";

// Pure validation speed, no HTTP in the way (k6.js measures the full stack).
const zodUser = z.object({
  name: z.string().min(2),
  age: z.number().int().min(18),
  email: z.string().email(),
});

const yupUser = yup.object({
  name: yup.string().min(2).required(),
  age: yup.number().integer().min(18).required(),
  email: yup.string().email().required(),
});

const valid = { name: "Ana", age: 30, email: "ana@x.com" };
const invalid = { name: "A", age: 15, email: "nope" };

const N = 100_000;

async function bench(label: string, fn: () => unknown | Promise<unknown>) {
  // warmup
  for (let i = 0; i < 1_000; i++) await fn();
  const start = performance.now();
  for (let i = 0; i < N; i++) await fn();
  const ms = performance.now() - start;
  console.log(
    `${label.padEnd(28)} ${ms.toFixed(0).padStart(6)} ms  ` +
      `(${Math.round(N / (ms / 1000)).toLocaleString()} ops/s)`
  );
}

console.log(`${N.toLocaleString()} iterations each\n`);

await bench("zod  valid   (safeParse)", () => zodUser.safeParse(valid));
await bench("yup  valid   (validateSync)", () => yupUser.validateSync(valid));
await bench("yup  valid   (validate)", () => yupUser.validate(valid));
await bench("zod  invalid (safeParse)", () => zodUser.safeParse(invalid));
await bench("yup  invalid (validate)", () =>
  yupUser.validate(invalid, { abortEarly: false }).catch(() => {})
);
