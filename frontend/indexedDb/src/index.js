import './main.scss'

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
    col.id = `status-${status.id}`
    col.classList.add('flex')
    col.ondrop = (e) => drop(e)
    col.ondragover = (e) => allowDrop(e)

    const title = document.createElement('h3')
    title.textContent = status.name.replace(/_/g, ' ').toUpperCase()
    title.classList.add('bg-primary', 'text-white', 'p-3')

    const list = document.createElement('div')
    list.classList.add('bg-gray-100')
    list.style.width = '100%'
    list.appendChild(title)

    const ul = document.createElement('ul')
    ul.classList.add('p-4')
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
    li.draggable = true
    li.id = `todo-${todo.id}`
    li.classList.add('bg-white', 'mb-4', 'p-3', 'rounded-2')
    li.addEventListener('dragstart', dragStart)
    li.addEventListener('dragend', dragEnd)

    const title = document.createElement('h4')
    title.textContent = todo.title
    li.appendChild(title)
    
    const delBtn = document.createElement('button')
    delBtn.textContent = 'Delete'
    delBtn.onclick = () => deleteTodo(todo.id)
    li.appendChild(delBtn)

    const ul = statusMap.get(todo.status_id)
    if (ul) ul.appendChild(li)
  })
}

function dragStart (e) {
  e.dataTransfer.setData('text/plain', e.target.id)
  setTimeout(() => {
    e.target.style.display = 'none'
  }, 0)
}

function dragEnd (e) {
  e.target.style.display = ''
}

function allowDrop (e) {
  e.preventDefault()
  e.currentTarget.classList.add('drag-over')
}

function drop (e) {
  e.preventDefault()
  const taskId = e.dataTransfer.getData('text/plain').split('-')[1]
  const statusId = e.currentTarget.id.split('-')[1]
  updateTodoStatus(parseInt(taskId), parseInt(statusId))
}