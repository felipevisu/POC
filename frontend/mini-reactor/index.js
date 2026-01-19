class Reactor {
  constructor() {
    this.handlers = {};
  }

  register(eventType, handler) {
    this.handlers[eventType] = handler;
  }

  dispatch(eventType, data) {
    this.handlers[eventType](data);
  }
}

const reactor = new Reactor();

reactor.register("read", (data) => {
  console.log("Data received:", data);
});

reactor.register("error", (err) => {
  console.error("Error:", err);
});

reactor.dispatch("read", "Hello Reactor");
reactor.dispatch("error", "Something went wrong");
