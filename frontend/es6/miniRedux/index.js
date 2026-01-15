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
console.log(state);
// { posts: [ 'Learn ES6' ], categories: [ 'Frontend' ] }

store.dispatch({ type: "ADD_CATEGORY", payload: "Backend" });
store.dispatch({ type: "ADD_POST", payload: "Learn Java" });
console.log(state);
// { posts: [ 'Learn ES6', 'Learn Java' ], categories: [ 'Frontend', 'Backend' ] }
