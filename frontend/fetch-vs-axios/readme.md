# Fetch VS Axios

**Tradeoffs**

| Feature | Axios | Fetch |
|---------|-------|-------|
| JSON Parsing | Automatic | Manual (requires two promises) |
| Timeout Support | Built-in | Requires AbortController |
| Object Payload | Native support | Requires JSON.stringify |
| Multiple Requests | Built-in support | Manual implementation |