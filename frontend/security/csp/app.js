localStorage.setItem('comments', JSON.stringify([{name: "Felipe", comment: "Some comment"}]))

const comments = JSON.parse(localStorage.getItem('comments') || '[]')

function render() {
  document.getElementById('comments').innerHTML = comments.map((c => 
    `<li>${c.name}: ${c.comment}</li>`
  )).join('')
}

render()