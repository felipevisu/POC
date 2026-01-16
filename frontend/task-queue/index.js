class RequestQueue {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.queue = [];
    this.executing = [];
  }

  enqueue(url, options = {}) {
    this.queue.push({ url, options, timestamp: Date.now() });
  }

  canMakeRequest() {
    const now = Date.now();
    this.executing = this.executing.filter(
      (time) => now - time < this.timeWindow
    );
    return this.executing.length < this.maxRequests;
  }

  async executeNext() {
    const request = this.queue.shift();
    this.executing.push(Date.now());
    console.log("Executing", request);
    try {
      const response = await fetch(request.url, request.options);
      const data = await response.json();
      return data;
    } catch {
      console.error("Request failed:");
      return null;
    }
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async start() {
    while (this.queue.length > 0) {
      if (this.canMakeRequest()) {
        this.executeNext();
      } else {
        await this.sleep(1000);
      }
    }
  }
}

const queue = new RequestQueue(1, 2000);

queue.enqueue("https://api.example.com/users/1");
queue.enqueue("https://api.example.com/users/2");
queue.enqueue("https://api.example.com/users/3");

queue.start();

queue.enqueue("https://api.example.com/users/4");
queue.enqueue("https://api.example.com/users/5");
queue.enqueue("https://api.example.com/users/6");
