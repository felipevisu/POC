# Task Queue

Create my own task queue and use it to queue requests.

**Motiviation:** Some API's has a request limit per second, like 100 requets every 10 seconds. When running stress tests, scrapping web pages settings this limit in a task queue would be usefull.

## Learnings

### Symbol

Use `Symbol` to create a property key that is hard to access accidentally. It’s mainly about encapsulation and collision avoidance.

```js
const _queue = Symbol("queue");

class RequestQueue {
  constructor() {
    this[_queue] = [];
  }
}
```

### WeakMap

Use `WeakMap`when you don't need to count, size, or have primitive keys. And use it when you need objects as keys.
