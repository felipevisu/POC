const term = new URLSearchParams(location.search).get('q')

if(term) {
  document.getElementById('results').innerHTML = `You searched for: <strong>${term}</strong>`
}

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

render()