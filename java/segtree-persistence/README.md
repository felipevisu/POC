# Persistent Segment Tree

A segment tree where every update creates a **new version** instead of mutating in place. Any past version stays queryable in O(log n).

## How it works

- Pointer-based nodes (`left`, `right`, `val`) instead of the usual array layout.
- `build` creates version 0 over the input array.
- `upgrade(prev, cur, ...)` performs a point update by **path copying**: only the O(log n) nodes on the root-to-leaf path are allocated; every other subtree is shared with the previous version by pointer.
- `query(version[k], ...)` runs a normal range-sum query against whichever root you pass.

Each version costs O(log n) extra memory, not O(n).

## Example (from `main`)

```
arr = [1, 2, 3, 4, 5]
v0 = build
v1 = v0 with arr[4] = 1
v2 = v1 with arr[2] = 10

query(v1, 0..4) = 11
query(v2, 3..4) = 5
query(v0, 0..3) = 10    <- v0 untouched
```

## Run

```bash
javac SegTree.java && java SegTree
```

## Related

- `java/segtree` — standard (non-persistent) segment tree, Java + Python port with tests
- `go/segment-tree`, `rust/segtree`, `python/segtree`, `frontend/segtree` — same structure in other languages
