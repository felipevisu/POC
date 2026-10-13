# XSS (Cross-site scripting)

A web secutiry vulnerability that lets attackers inject mailicious scripts (usually JavaScript) into trusted websites viewed by other users.

When web application gets some user input and display as HTML without validate, sanitize, encoding, that script will be rendered because it's considered ligitimate code. But it can be malicious.

## Examples 

### 1 - Query strings

You have a website and use this query string: `https://example.com/q?some_term`

And the site display the query in some session:

```js
const term = new URLSearchParams(location.search).get('q')

if(term) {
  document.getElementById('results').innerHTML = `You searched for: <strong>${term}</strong>`
}
```

You expect the query to be a string, but what happens if someone adds an HTML there?: `https://example.com/q?<a href="http://...">Your account is in dangeours, click here to solve now.</a>`

**This will be rendered in your screen.**

The correct way of doing this is parsing the value before rendering, and avoid the usage of `innerHTML`. Preffer javascript attributes like `textContent`

```js
const term = new URLSearchParams(location.search).get('q')

if(term) {
  const highlight = document.createElement('strong')
  highlight.textContent = term
  document.getElementById('results').replaceChildren('You searched for: ', highlight)
}
```

### 2 - Directly rendering user inputs

Let's say your site has a comments session, if you accept everything the user enters and directly display on the screen your site isn't protected.

```html
<ul id="comments"></ul>
<form id="form-comments">
    <input name="author" placeholder="Your name" required>
    <input name="site" placeholder="Your site (https://...)">
    <textarea name="comment" placeholder="Comment" required></textarea>
    <button>Send</button>
</form>
```

The javascript code will save and render whatever the user types here

```js
const comments = JSON.parse(localStorage.getItem('comments') || '[]')

function render() {
  document.getElementById('comments').innerHTML = comments.map((c => 
    `<li><a href="${c.site}">${c.author}</a>: ${c.comment}</li>`
  )).join('')
}

document.getElementById('form-comments').addEventListener('submit', (e) => {
  e.preventDefault()
  comments.push(Object.fromEntries(new FormData(e.target)))
  localStorage.setItem('comments', JSON.stringify(comments))
  e.target.reset()
  render()
})
```

What happens if the user types some HTML in the comments input? Well... this HTML will be rendered in your website as a legitimate code.

The correct way of doind this is avoid `innetHTML`, create each element as HTML object, and always render the user input as string.

```js
function secureURL(entry){
  if(!entry) return null;
  try {
    const url = new URL(entry);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null
  }
}

function createItem(c) {
  const li = document.createElement('li')
  const href = secureURL(c.site)
  const author = document.createElement(href ? 'a' : 'span')
  const comment = document.createElement('span').textContent = c.comment
  if(href){
    author.href = href
    author.rel = 'noopener noreferrer nofollow'
  }
  author.textContent = c.author
  li.append(author, ': ', comment)
  return li
}

const comments = JSON.parse(localStorage.getItem('comments') || '[]')

function render() {
  document.getElementById('comments').replaceChildren(...comments.map(createItem))
}
```