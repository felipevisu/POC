import createStore from "./store.js";

function reducer(state, action) {
  switch (action.type) {
    case "ADD_POST":
      return {
        ...state,
        posts: [...state.posts, action.payload],
      };
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    default:
      return state;
  }
}

const store = createStore(reducer, {
  posts: ["Learn ES6"],
  categories: ["Frontend"],
});

const state = store.getState();
console.log(state); // { posts: [ 'Learn ES6' ], categories: [ 'Frontend' ] }

store.dispatch({ type: "ADD_CATEGORY", payload: "Backend" });
store.dispatch({ type: "ADD_POST", payload: "Learn Java" });
console.log(state); // { posts: [ 'Learn ES6', 'Learn Java' ], categories: [ 'Frontend', 'Backend' ] }

try {
  store.getState().categories = []; // This will not work because proxy set is not implemented
} catch (e) {
  console.log(e.message); // Cannot mutate direcly, use dispatch()
  console.log(state); // { posts: [ 'Learn ES6', 'Learn Java' ], categories: [ 'Frontend', 'Backend' ] }
}

const categoriesForm = document.querySelector("#categories-form");
const categoriesList = document.querySelector("#categories-list");
const postsForm = document.querySelector("#posts-form");
const postsList = document.querySelector("#posts-list");

function renderCategories() {
  const { categories } = store.getState();

  categoriesList.innerHTML =
    "<ul>" +
    categories.map((category) => `<li><p>${category}</p></li>`).join("") +
    "</ul>";
}

function renderPosts() {
  const { posts } = store.getState();

  postsList.innerHTML =
    "<ul>" + posts.map((post) => `<li><p>${post}</p></li>`).join("") + "</ul>";
}

categoriesForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = categoriesForm.querySelector("input");
  const categoryName = input.value.trim();

  if (categoryName) {
    store.dispatch({
      type: "ADD_CATEGORY",
      payload: categoryName,
    });
    input.value = "";
  }
});

postsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = postsForm.querySelector("input");
  const postName = input.value.trim();

  if (postName) {
    store.dispatch({
      type: "ADD_POST",
      payload: postName,
    });
    input.value = "";
  }
});

store.subscribe(renderCategories);
store.subscribe(renderPosts);

renderPosts();
renderCategories();
