import { useState } from "react";
import { observer } from "mobx-react-lite";
import { todoStore } from "../stores/TodoStore.js";

export const TodoList = observer(() => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    todoStore.addTodo(trimmed);
    setInput("");
  };

  return (
    <div>
      <h2>Todos</h2>

      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit">Add</button>
      </form>

      <div className="filters">
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            className={todoStore.filter === f ? "active" : ""}
            onClick={() => todoStore.setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {todoStore.filteredTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => todoStore.toggleTodo(todo.id)}
              />
              <span>{todo.title}</span>
            </label>
            <button className="remove" onClick={() => todoStore.removeTodo(todo.id)}>
              x
            </button>
          </li>
        ))}
      </ul>

      {todoStore.completedCount > 0 && (
        <button className="clear-btn" onClick={() => todoStore.clearCompleted()}>
          Clear completed ({todoStore.completedCount})
        </button>
      )}
    </div>
  );
});
