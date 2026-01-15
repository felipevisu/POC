function createStore(reducer, initialState) {
  const state = { ...initialState };

  const handler = {
    get(target, prop) {
      return prop in target ? target[prop] : null;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  };

  const proxy = new Proxy(state, handler);

  function getState() {
    return proxy;
  }

  function dispatch(action) {
    const newState = reducer(state, action);
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, newState);
  }

  return {
    getState,
    dispatch,
  };
}

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

store.dispatch({ type: "ADD_CATEGORY", payload: "Backend" });

console.log(state);
