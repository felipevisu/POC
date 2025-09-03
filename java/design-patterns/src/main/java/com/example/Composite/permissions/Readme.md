# Composite Pattern

The Composite pattern is a structural design pattern that lets you treat individual objects (leaves) and groups of objects (composites) uniformly.
It’s especially useful for representing hierarchical data (trees).

### ✅ Pros

* Treats individual and grouped objects uniformly.
* Makes working with hierarchical structures (like trees) easier.
* Simplifies client code since it doesn’t need to distinguish between leaf and composite.
* Open to extension (easy to add new types of leaves/composites).

### ❌ Cons

* Can make the design too general, making it harder to restrict components (e.g., prevent a Permission from containing a Role).
* Overhead when the hierarchy is simple (sometimes over-engineering).
* Debugging can be harder due to recursive structures.

### 💡 Common Use Cases

**Backend Systems**
* Role-Based Access Control (RBAC): roles containing roles and permissions.
* Organizational hierarchies: departments, teams, employees.
* File systems: directories (composite) and files (leaf).

**Frontend / UI**

* Menus, buttons, and nested components.
* Data Structures
* Expression trees, XML/JSON parsing.