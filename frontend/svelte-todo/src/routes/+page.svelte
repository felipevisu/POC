<script lang="js">
    import Header from "../components/header.svelte";

    let index = 0
    let title = $state('')
    let todoList = $state([])

    function addTodo(){
        todoList.push({
            id: index,
            title: title
        })
        index += 1
        title = ''
    }

    function deleteTodo(id){
        todoList = todoList.filter((t) => t.id !== id)
    }
</script>

<div>
    <Header />
    <div>
        <input placeholder="To-Do title" bind:value={title} />
        <button onclick={addTodo}>Add To-Do</button>
    </div>
    <p>{todoList.length} To-Do's added</p>
    <ul>
        {#each todoList as todo}
            <li>{todo.title} <button onclick={() => deleteTodo(todo.id)}>Delete</button></li>
        {/each}
    </ul>
</div>

