## 🎁 Decorator Pattern
**Definition:**
The Decorator Pattern allows behavior to be added to individual objects, dynamically, without affecting other objects of the same class.

### ✅ Pros:
* Follows Open/Closed Principle — add behavior without modifying code.
* Flexible alternative to subclassing.
* Can combine multiple decorators for complex behavior.

### ❌ Cons:
* Adds many small classes.
* Harder to debug due to layers of wrapping.
* Can become messy if overused.

### 📌 When to Use:
* When you want to dynamically add or remove behavior.
* When subclassing leads to too many classes.
* When you want to reuse behavior across different classes.