let db

/*
TodoDB is the name of the database
1 is the schema version
 */
const request = indexedDB.open('TodoDB', 2)

request.onerror = () => {
  console.error('Error occurred')
}

request.onsuccess = (e) => {
  db = e.target.result
  console.log('Database successful')
  fetchTodos()
}

request.onupgradeneeded = (e) => {
  db = e.target.result
  // Create the database for the first time or when increment the version
  const store = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true })
  // Create a column title
  store.createIndex('title', 'title', { unique: false })
}

document.querySelector('#todo-form').addEventListener('submit', (e) => {
  e.preventDefault()
  addTodo()
})

const addTodo = () => {
  if (!db) {
    console.error('Database not ready yet')
    return
  }

  const input = document.querySelector('#todo-title')
  const title = input.value.trim()
  if (!title) return

  const transaction = db.transaction('todos', 'readwrite')
  const store = transaction.objectStore('todos')
  store.add({ title })

  transaction.oncomplete = () => {
    input.value = ''
  }
}

const fetchTodos = () => {
  const transaction = db.transaction('todos', 'readonly')
  const store = transaction.objectStore('todos')
  const request = store.getAll()

  request.onsuccess = () => {
    const todos = request.result
    const list = document.querySelector('#todo-list')
    list.innerHTML = ''
    todos.forEach(todo => {
      const li = document.createElement('li')
      li.textContent = todo.title
      const deleteButton = document.createElement('button')
      deleteButton.textContent = 'Delete'
      deleteButton.onClick = () => deleteTodo(todo.id)
      li.appendChild(deleteButton)
      list.appendChild(li)
    })
  }
}

const deleteTodo = (id) => {
  const transaction = db.transaction('todos', 'readwrite')
  const store = transaction.objectStore('todos')
  store.delete(id)

  transaction.oncomplete = () => {
    fetchTodos()
  }

  transaction.onerror = (e) => {
    console.error('Delete failed:', e.target.error)
  }
}