function createStore(reducer, initialState) {
  let state = { ...initialState };
  let listeners = [];

  const handler = {
    get(target, prop) {
      return prop in target ? target[prop] : null;
    },
    set(target, prop, value) {
      throw new Error("Cannot mutate direcly, use dispatch()");
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
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  return {
    getState,
    dispatch,
    subscribe,
  };
}

export default createStore;
