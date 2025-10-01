class LRUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.history = []
        self.hash = {}

    def save(self, key):
        if key in self.history:
            self.history.remove(key)
        self.history = [key] + self.history
        if len(self.history) > self.capacity:
            removed = self.history.pop()
            del self.hash[removed]

    def get(self, key: int) -> int:
        if key in self.hash:
            self.save(key)
            return self.hash[key]
        return -1

    def put(self, key: int, value: int) -> None:
        self.hash[key] = value
        self.save(key)
