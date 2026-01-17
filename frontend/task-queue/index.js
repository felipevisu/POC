const _queue = Symbol("queue");
const _timestamps = Symbol("timestamps");
const _metadata = Symbol("metadata");

class RequestQueue {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this[_queue] = [];
    this[_metadata] = new WeakMap();
    this[_timestamps] = new Map();
  }

  enqueue(url, options = {}, priority = 0) {
    const request = { url, options, id: Date.now() + Math.random() };
    this[_queue].push(request);
    this[_metadata].set(request, {
      priority,
      attempts: 0,
      addedAt: Date.now(),
    });
    return request;
  }

  canMakeRequest() {
    const now = Date.now();
    for (const [id, timestamp] of this[_timestamps]) {
      if (now - timestamp >= this.timeWindow) {
        this[_timestamps].delete(id);
      }
    }
    return this[_timestamps].size < this.maxRequests;
  }

  async executeNext() {
    const request = this[_queue].shift();
    const requestId = `req_${Date.now()}`;
    this[_timestamps].set(requestId, Date.now());
    const metadata = this[_metadata].get(request);
    if (metadata) {
      metadata.attempts++;
      metadata.lastAttempt = Date.now();
    }
    console.log("Executing request", request, metadata);
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
    while (this[_queue].length > 0) {
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
