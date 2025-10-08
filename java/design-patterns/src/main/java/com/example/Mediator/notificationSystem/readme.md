# Mediator Design Pattern

The Mediator pattern is a behavioral design pattern that reduces direct dependencies between objects by having them communicate through a central mediator instead of referencing each other directly.

## ✅ Pros

* Reduces coupling between components.
* Centralizes interaction logic in one place.
* Easy to add new components without modifying existing ones.
* Simplifies complex communication patterns.

## ❌ Cons

* Mediator can become overly complex (God Object).
* Adds indirection, which may reduce performance.
* Single point of failure if mediator has bugs.

## 💡 Common Use Cases
**Backend Systems**

* Event/notification systems handling user registrations, orders, payments.
* Workflow orchestration across microservices.
* Message routing and command dispatching.

**Frontend / UI**

* Dialog managers coordinating forms, buttons, and validation.
* Chat rooms mediating messages between users.
* Multi-step wizards with interdependent components.