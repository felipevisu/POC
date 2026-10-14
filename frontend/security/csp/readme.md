# CSP

This code implements a Content Security Policy using hash in the scripts.

The script loads all scripts present in the HTML and creates a hash for each one, the CSP only renders scripts with the correct hash and one hash is generated per session.

```js
const scripts = html.matchAll(/<script>([\s\S]*?)<\/script>/g)
const hashes = []
scripts.forEach((script) => {
  const hash = crypto.createHash('sha256').update(script[1], 'utf8').digest('base64');
  hashes.push(`'sha256-${hash}'`)
}) 

```

With this approach external scripts like comming from comments or APIs will not be executed.

```html
<img src=x onerror="alert('XSS: ' + document.cookie)">`
```