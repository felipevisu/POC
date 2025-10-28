## 🏭 Factory Method Pattern

Definition:
A creational design pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.

### ✅ Pros:
* Promotes loose coupling by not instantiating concrete classes directly.
* Makes code easier to extend (open/closed principle).
* Allows variation in object creation logic.

### ❌ Cons:
* Adds complexity with more classes and inheritance.
* Might be overkill for simple object creation needs.

### 📌 When to Use:
* When the exact type of object isn’t known until runtime.
* When you want to delegate instantiation to subclasses.
* When creating many related objects with common interface but different implementations.

### Diagram

<img src="https://refactoring.guru/images/patterns/diagrams/abstract-factory/example.png?id=5928a61d18bf00b047463471c599100a" />