package segtree

type Tree[T comparable] struct {
	n int
	tree []T
	lazy []T
	zero T
	merge func(T, T) T
	apply func(val, update T, count int) T
	comp func(a, b T) T
}

func New[T comparable](data []T, merge func(T, T) T, zero T, apply func(T, T, int) T, comp func(T, T) T) *Tree[T] {
	n := len(data)
	t := &Tree[T]{
		n: n,
		tree: make([]T, 4*n),
		lazy: make([]T, 4*n),
		zero: zero,
		merge: merge,
		apply: apply,
		comp: comp,
	}
	for i := range t.lazy {
		t.lazy[i] = zero
	}
	if n > 0 {
		t.build(data, 1, 0, n-1)
	}
	return t
}

func (t *Tree[T]) build(data []T, node, lo, hi int) {
	if lo == hi {
		t.tree[node] = data[lo]
		return
	}
	mid := lo + (hi-lo)/2
	t.build(data, 2*node, lo, mid)
	t.build(data, 2*node+1, mid+1, hi)
	t.tree[node] = t.merge(t.tree[2*node], t.tree[2*node+1])
}

func (t *Tree[T]) push(node, lo, hi int) {
	if t.lazy[node] != t.zero {
		mid := lo + (hi-lo)/2
		t.applyLazy(2*node, lo, mid, t.lazy[node])
		t.applyLazy(2*node+1, mid+1, hi, t.lazy[node])
		t.lazy[node] = t.zero
	}
}

func (t *Tree[T]) applyLazy(node, lo, hi int, val T) {
	t.tree[node] = t.apply(t.tree[node], val, hi-lo+1)
	t.lazy[node] = t.comp(t.lazy[node], val)
}

func (t *Tree[T]) Update(l, r int, delta T) {
	t.update(1, 0, t.n-1, l, r, delta)
}

func (t *Tree[T]) update(node, lo, hi, l, r int, delta T) {
	if r < lo || hi < l {
		return
	}
	if l <= lo && hi <= r {
		t.applyLazy(node, lo, hi, delta)
		return
	}
	t.push(node, lo, hi)
	mid := lo + (hi-lo)/2
	t.update(2*node, lo, mid, l, r, delta)
	t.update(2*node+1, mid+1, hi, l, r, delta)
	t.tree[node] = t.merge(t.tree[2*node], t.tree[2*node+1])
}

func (t *Tree[T]) Query(l, r int) T {
	return t.query(1, 0, t.n-1, l, r)
}

func (t *Tree[T]) query(node, lo, hi, l, r int) T {
	if r < lo || hi < l {
		return t.zero
	}
	if l <= lo && hi <= r {
		return t.tree[node]
	}
	t.push(node, lo, hi)
	mid := lo + (hi-lo)/2
	left := t.query(2*node, lo, mid, l, r)
	right := t.query(2*node+1, mid+1, hi, l, r)
	return t.merge(left, right)
}

func (t *Tree[T]) Set(i int, val T) {
	t.set(1, 0, t.n-1, i, val)
}

func (t *Tree[T]) set(node, lo, hi, i int, val T) {
	if lo == hi {
		t.tree[node] = val
		t.lazy[node] = t.zero
		return
	}
	t.push(node, lo, hi)
	mid := lo + (hi-lo)/2
	if i <= mid {
		t.set(2*node, lo, mid, i, val)
	} else {
		t.set(2*node+1, mid+1, hi, i, val)
	}
	t.tree[node] = t.merge(t.tree[2*node], t.tree[2*node+1])
}

func (t *Tree[T]) Len() int {
	return t.n
}
