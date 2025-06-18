let db

/*
TodoDB is the name of the database
1 is the schema version
 */
const request = indexedDB.open('TodoDB', 3)

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

  if (!db.objectStoreNames.contains('statuses')) {
    const store = db.createObjectStore('statuses', { keyPath: 'id', autoIncrement: true })
    store.createIndex('name', 'name', { unique: true })

    const initialStatuses = [
      { id: 1, name: 'todo' },
      { id: 2, name: 'in_progress' },
      { id: 3, name: 'in_review' },
      { id: 4, name: 'in_test' },
      { id: 5, name: 'completed' },
    ]

    initialStatuses.forEach(status => store.add(status))
  }

  if (!db.objectStoreNames.contains('todos')) {
    const store = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true })
    store.createIndex('title', 'title', { unique: false })
    store.createIndex('status_id', 'status_id', { unique: false })
  }

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
  store.add({ title, status_id: 1 })

  transaction.oncomplete = () => {
    input.value = ''
    fetchTodos()
  }

  transaction.onerror = (e) => {
    console.error('Delete failed:', e.target.error)
  }
}

const fetchTodos = () => {
  const board = document.getElementById('todo-board')
  board.innerHTML = ''

  const transaction = db.transaction(['todos', 'statuses'], 'readonly')
  const todoStore = transaction.objectStore('todos')
  const statusStore = transaction.objectStore('statuses')

  statusStore.getAll().onsuccess = (statusEvent) => {
    const statuses = statusEvent.target.result
    const statusMap = renderStatuses(board, statuses)

    todoStore.getAll().onsuccess = (todoEvent) => {
      const todos = todoEvent.target.result
      renderTodos(todos, statuses, statusMap)
    }
  }
}

const deleteTodo = (id) => {
  const transaction = db.transaction('todos', 'readwrite')
  const store = transaction.objectStore('todos')
  store.delete(id)

  transaction.oncomplete = fetchTodos

  transaction.onerror = (e) => {
    console.error('Delete failed:', e.target.error)
  }
}

const updateTodoStatus = (id, newStatusId) => {
  const transaction = db.transaction('todos', 'readwrite')
  const store = transaction.objectStore('todos')
  const getRequest = store.get(id)

  getRequest.onsuccess = () => {
    const todo = getRequest.result
    todo.status_id = newStatusId
    store.put(todo)
  }

  transaction.oncomplete = fetchTodos
}

const renderStatuses = (board, statuses) => {
  const statusMap = new Map()

  statuses.forEach(status => {
    const col = document.createElement('div')
    col.classList.add('flex')

    const title = document.createElement('h3')
    title.textContent = status.name.replace(/_/g, ' ').toUpperCase()

    const list = document.createElement('div')
    list.classList.add('bg-gray-200')
    list.classList.add('p-3')
    list.style.width = '100%'
    list.appendChild(title)

    const ul = document.createElement('ul')
    list.appendChild(ul)
    col.appendChild(list)

    board.appendChild(col)
    statusMap.set(status.id, ul)
  })

  return statusMap
}

function renderTodos (todos, statuses, statusMap) {
  todos.forEach(todo => {
    const li = document.createElement('li')

    const title = document.createElement('h4')
    title.textContent = todo.title
    li.appendChild(title)

    const select = document.createElement('select')
    statuses.forEach(s => {
      const option = document.createElement('option')
      option.value = s.id
      option.textContent = s.name.replace(/_/g, ' ')
      if (s.id === todo.status_id) option.selected = true
      select.appendChild(option)
    })

    select.onchange = () => updateTodoStatus(todo.id, Number(select.value))
    li.appendChild(select)

    const delBtn = document.createElement('button')
    delBtn.textContent = 'Delete'
    delBtn.onclick = () => deleteTodo(todo.id)
    li.appendChild(delBtn)

    const ul = statusMap.get(todo.status_id)
    if (ul) ul.appendChild(li)
  })
}