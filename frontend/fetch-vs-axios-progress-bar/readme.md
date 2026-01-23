# Download progress bar with Fetch

The reponse headers informs the size of the fiel

```js
 const contentLength = response.headers.get('content-length');
```

The response body already contains a reader

```js
const reader = response.body.getReader();
```

Then we should iterate in a loop to load the chunks

```js
let chunks = []
while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    chunks.push(value);
}
```

And finally transform the chunks in blob

```js
const blob = new Blob(chunks);
```