# Zod vs Yup

Side-by-side comparison of the two most common TypeScript schema-validation libraries. Each demo isolates one design difference; `demo6` measures it.

Versions: zod 4.4.3, yup 1.7.1.

## Demos

| Demo | Topic | Run |
|---|---|---|
| `demo1` | Type inference defaults — Yup infers everything optional, Zod everything required | `npm run demo1:zod` / `demo1:yup` |
| `demo2` | Expressing the same shape — `.required()` everywhere vs `.optional()` where needed | `npm run demo2:*` |
| `demo3` | Error handling — `safeParse` result object vs thrown `ValidationError` | `npm run demo3:*` |
| `demo4` | Sync vs async — Zod is sync by default, Yup leans on `validate()` returning a Promise | `npm run demo4:*` |
| `demo5` | Conditional validation — Yup `.when()` vs Zod discriminated unions / `superRefine` | `npm run demo5:*` |
| `demo0` | Live API boundary — Express server with both validators and Swagger UI | `npm run demo0` |
| `demo6` | Benchmark — micro-benchmark + k6 load test | `npm run bench` / `npm run bench:k6` |

## Results (demo6)

100k iterations, pure validation:

```
zod  valid   (safeParse)         21 ms   4.67M ops/s
yup  valid   (validateSync)     198 ms   0.51M ops/s
zod  invalid (safeParse)        751 ms   133k ops/s
yup  invalid (validate)        4383 ms    23k ops/s
```

HTTP via k6 (20 VUs, 30s each): zod p95 **897 µs** vs yup p95 **1.62 ms** — ~1.75× faster even with Express dominating request time.

Full numbers and caveats in [`demo6/RESULTS.md`](demo6/RESULTS.md).

## Talk material

- `slides.html` — presentation deck
- `discurso.md` — spoken script (PT-BR) that walks through the demos in order

## Run

```bash
npm install
npm run demo1:zod        # any demo
npm run demo0            # then open http://localhost:3000/docs
npm run bench
npm run bench:k6         # needs demo0 running and k6 installed
```

## Stack

TypeScript · tsx · Express 5 · swagger-ui-express · k6
