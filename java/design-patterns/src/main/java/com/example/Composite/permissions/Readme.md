# Command Pattern

The Command pattern is a behavioral design pattern that encapsulates a request as an object.  
This allows you to parameterize clients with different requests, queue or log requests, and support undo/redo operations.

### ✅ Pros

* Decouples the sender of a request from its receiver.
* Supports undo/redo functionality easily.
* Allows queuing and scheduling of requests.
* Enables logging of executed operations.
* Makes it easy to add new commands without changing existing code.

### ❌ Cons

* Increases the number of classes (one per command).
* Can add complexity when you only need simple operations.
* May require careful handling of command history (for undo/redo).

### 💡 Common Use Cases

**Backend Systems**
* Task scheduling and job queues.
* Transaction management (commit/rollback).
* Logging operations for auditing.
* Macro recording in systems (replayable commands).

**Frontend / UI**
* Implementing undo/redo in editors (text, graphics, IDEs).
* Menu items and buttons triggering commands.
* Keyboard shortcuts mapped to actions.
* Macro systems for automating user actions.