function createStore(reducer, initialState) {
  const state = { ...initialState };

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
  }

  return {
    getState,
    dispatch,
  };
}

export default createStore;
