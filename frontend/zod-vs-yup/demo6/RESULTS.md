# Benchmark: zod vs yup

zod 4.4.3, yup 1.7.1, Node/tsx, MacBook.

## Pure validation (npm run bench)

100k iterations, same schema as demo0.

```
zod  valid   (safeParse)         21 ms  (4,669,933 ops/s)
yup  valid   (validateSync)     198 ms  (505,861 ops/s)
yup  valid   (validate)         193 ms  (517,234 ops/s)
zod  invalid (safeParse)        751 ms  (133,084 ops/s)
yup  invalid (validate)        4383 ms  (22,816 ops/s)
```

zod ~9x faster on valid input, ~6x on invalid.

## HTTP via k6 (npm run bench:k6)

demo0 server, 20 VUs, 30s per library.

```
http_req_duration    zod        yup
avg                  512 µs     901 µs
med                  438 µs     844 µs
p95                  897 µs     1.62 ms
```

~1.75x faster even with express eating most of the request time.

Notes:
- k6 reports http_req_failed 50% — that's the invalid payloads getting their 400s, checks all pass.
- if port 3000 has something else on IPv4 (ssh tunnel etc), use `-e BASE_URL='http://[::1]:3000'`.
