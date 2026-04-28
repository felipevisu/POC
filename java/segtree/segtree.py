"""Point-update, range-sum segment tree keyed by integer in [lo, hi]."""

from __future__ import annotations


class SegmentTree:
    def __init__(self, lo: int, hi: int):
        if hi < lo:
            raise ValueError("hi must be >= lo")
        self.lo = lo
        self.hi = hi
        self.n = hi - lo + 1
        self.tree = [0] * (4 * self.n)

    def update(self, key: int, delta: float) -> None:
        if not self.lo <= key <= self.hi:
            raise ValueError(f"key {key} out of range [{self.lo}, {self.hi}]")
        self._update(1, 0, self.n - 1, key - self.lo, delta)

    def query(self, lo: int, hi: int) -> float:
        lo = max(lo, self.lo)
        hi = min(hi, self.hi)
        if lo > hi:
            return 0
        return self._query(1, 0, self.n - 1, lo - self.lo, hi - self.lo)

    def _update(self, node: int, tl: int, tr: int, idx: int, delta: float) -> None:
        if tl == tr:
            self.tree[node] += delta
            return
        tm = (tl + tr) // 2
        if idx <= tm:
            self._update(2 * node, tl, tm, idx, delta)
        else:
            self._update(2 * node + 1, tm + 1, tr, idx, delta)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def _query(self, node: int, tl: int, tr: int, l: int, r: int) -> float:
        if r < tl or tr < l:
            return 0
        if l <= tl and tr <= r:
            return self.tree[node]
        tm = (tl + tr) // 2
        return (
            self._query(2 * node, tl, tm, l, r)
            + self._query(2 * node + 1, tm + 1, tr, l, r)
        )
