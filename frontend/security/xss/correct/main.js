const term = new URLSearchParams(location.search).get('q')

if(term) {
  const highlight = document.createElement('strong')
  highlight.textContent = term
  document.getElementById('results').replaceChildren('Você buscou por: ', highlight)
}


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

document.getElementById('form-comments').addEventListener('submit', (e) => {
  e.preventDefault()
  comments.push(Object.fromEntries(new FormData(e.target)))
  localStorage.setItem('comments', JSON.stringify(comments))
  e.target.reset()
  render()
})

render()