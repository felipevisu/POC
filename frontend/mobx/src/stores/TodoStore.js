import { makeAutoObservable, runInAction } from "mobx";

class TodoStore {
  todos = [];
  filter = "all";

  constructor() {
    makeAutoObservable(this);
  }

  addTodo(title) {
    this.todos.push({
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
    });
  }

  removeTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) todo.completed = !todo.completed;
  }

  setFilter(filter) {
    this.filter = filter;
  }

  clearCompleted() {
    this.todos = this.todos.filter((t) => !t.completed);
  }

  get filteredTodos() {
    switch (this.filter) {
      case "active":
        return this.todos.filter((t) => !t.completed);
      case "completed":
        return this.todos.filter((t) => t.completed);
      default:
        return this.todos;
    }
  }

  get completedCount() {
    return this.todos.filter((t) => t.completed).length;
  }

  get activeCount() {
    return this.todos.filter((t) => !t.completed).length;
  }

  get totalCount() {
    return this.todos.length;
  }
}

export const todoStore = new TodoStore();
