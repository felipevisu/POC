# Flyweight Pattern

The Flyweight pattern is a structural design pattern that helps minimize memory usage by sharing as much data as possible between similar objects.  
It separates **intrinsic state** (shared, immutable data) from **extrinsic state** (context-dependent data), allowing many objects to reuse the same shared representation.

### ✅ Pros

* Significantly reduces memory footprint when dealing with a large number of similar objects.
* Improves performance in systems with high object creation costs.
* Makes shared, immutable data easier to manage and reuse.

### ❌ Cons

* Increases code complexity by splitting intrinsic vs. extrinsic state.
* Clients must manage extrinsic state, which can make usage less intuitive.
* Best suited for very large object sets—overhead may not be worth it for smaller systems.

### 💡 Common Use Cases

**Backend Systems**
* Caching frequently used objects (e.g., database connections, configuration tokens).
* Storing large sets of objects with repeating data (e.g., user roles, permissions).
* Representing millions of fine-grained entities (e.g., particles, map tiles, logs).

**Frontend / UI**
* Rendering text: characters (glyphs) share fonts and styles, only position changes.
* UI components with repeated styling/data (icons, shapes, background patterns).
* Game development: thousands of objects (trees, bullets, NPCs) sharing meshes or textures.  
