package segtree_test

import (
	"math"
	"testing"

	segtree "github.com/felipefaria/segment-tree"
)

func sumTree(data []int) *segtree.Tree[int] {
	return segtree.New(data,
		func(a, b int) int { return a + b },
		0,
		func(val, upd int, cnt int) int { return val + upd*cnt },
		func(a, b int) int { return a + b },
	)
}

func minTree(data []int) *segtree.Tree[int] {
	return segtree.New(data,
		func(a, b int) int {
			if a < b {
				return a
			}
			return b
		},
		math.MaxInt,
		func(val, upd int, _ int) int { return val + upd },
		func(a, b int) int { return a + b },
	)
}

func TestSumQuery(t *testing.T) {
	st := sumTree([]int{1, 3, 5, 7, 9, 11})

	tests := []struct {
		l, r, want int
	}{
		{0, 5, 36},
		{0, 0, 1},
		{1, 3, 15},
		{4, 5, 20},
		{2, 2, 5},
	}
	for _, tt := range tests {
		got := st.Query(tt.l, tt.r)
		if got != tt.want {
			t.Errorf("Query(%d,%d) = %d, want %d", tt.l, tt.r, got, tt.want)
		}
	}
}

func TestPointSet(t *testing.T) {
	st := sumTree([]int{1, 2, 3, 4, 5})

	st.Set(2, 10) // [1, 2, 10, 4, 5]

	if got := st.Query(0, 4); got != 22 {
		t.Errorf("after Set: Query(0,4) = %d, want 22", got)
	}
	if got := st.Query(2, 2); got != 10 {
		t.Errorf("after Set: Query(2,2) = %d, want 10", got)
	}
}

func TestRangeUpdate(t *testing.T) {
	st := sumTree([]int{0, 0, 0, 0, 0})

	st.Update(1, 3, 5) // [0, 5, 5, 5, 0]

	if got := st.Query(0, 4); got != 15 {
		t.Errorf("Query(0,4) = %d, want 15", got)
	}
	if got := st.Query(1, 3); got != 15 {
		t.Errorf("Query(1,3) = %d, want 15", got)
	}
	if got := st.Query(0, 0); got != 0 {
		t.Errorf("Query(0,0) = %d, want 0", got)
	}

	st.Update(0, 4, 2) // [2, 7, 7, 7, 2]

	if got := st.Query(0, 4); got != 25 {
		t.Errorf("after second update: Query(0,4) = %d, want 25", got)
	}
}

func TestMinQuery(t *testing.T) {
	st := minTree([]int{5, 2, 8, 1, 9, 3})

	if got := st.Query(0, 5); got != 1 {
		t.Errorf("Query(0,5) = %d, want 1", got)
	}
	if got := st.Query(0, 2); got != 2 {
		t.Errorf("Query(0,2) = %d, want 2", got)
	}
	if got := st.Query(4, 5); got != 3 {
		t.Errorf("Query(4,5) = %d, want 3", got)
	}
}

func TestMinRangeUpdate(t *testing.T) {
	st := minTree([]int{5, 2, 8, 1, 9, 3})

	st.Update(3, 5, -5) // [5, 2, 8, -4, 4, -2]

	if got := st.Query(0, 5); got != -4 {
		t.Errorf("Query(0,5) = %d, want -4", got)
	}
	if got := st.Query(0, 2); got != 2 {
		t.Errorf("Query(0,2) = %d, want 2", got)
	}
}

func TestLen(t *testing.T) {
	st := sumTree([]int{1, 2, 3})
	if st.Len() != 3 {
		t.Errorf("Len() = %d, want 3", st.Len())
	}
}

func TestEmpty(t *testing.T) {
	st := sumTree(nil)
	if st.Len() != 0 {
		t.Errorf("Len() = %d, want 0", st.Len())
	}
}

func TestSingleElement(t *testing.T) {
	st := sumTree([]int{42})

	if got := st.Query(0, 0); got != 42 {
		t.Errorf("Query(0,0) = %d, want 42", got)
	}
	st.Update(0, 0, 8)
	if got := st.Query(0, 0); got != 50 {
		t.Errorf("after Update: Query(0,0) = %d, want 50", got)
	}
}

func BenchmarkBuild(b *testing.B) {
	data := make([]int, 100_000)
	for i := range data {
		data[i] = i
	}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		sumTree(data)
	}
}

func BenchmarkQuery(b *testing.B) {
	data := make([]int, 100_000)
	for i := range data {
		data[i] = i
	}
	st := sumTree(data)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		st.Query(1000, 90000)
	}
}

func BenchmarkUpdate(b *testing.B) {
	data := make([]int, 100_000)
	for i := range data {
		data[i] = i
	}
	st := sumTree(data)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		st.Update(1000, 90000, 1)
	}
}
