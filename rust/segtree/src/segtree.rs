//! Point-update, range-sum segment tree keyed by integer in `[low, high]`.

#[derive(Debug, Clone)]
pub struct SegmentTree {
    low: i64,
    high: i64,
    n: usize,
    tree: Vec<f64>,
}

impl SegmentTree {
    pub fn new(low: i64, high: i64) -> Self {
        assert!(high >= low, "high must be >= low");
        let n = (high - low + 1) as usize;
        Self {
            low,
            high,
            n,
            tree: vec![0.0; 4 * n],
        }
    }

    pub fn low(&self) -> i64 {
        self.low
    }

    pub fn high(&self) -> i64 {
        self.high
    }

    pub fn update(&mut self, key: i64, delta: f64) {
        assert!(
            key >= self.low && key <= self.high,
            "key {} out of range [{}, {}]",
            key,
            self.low,
            self.high
        );
        let idx = (key - self.low) as usize;
        let last = self.n - 1;
        self.update_rec(1, 0, last, idx, delta);
    }

    pub fn query(&self, low: i64, high: i64) -> f64 {
        let low = low.max(self.low);
        let high = high.min(self.high);
        if low > high {
            return 0.0;
        }
        let l = (low - self.low) as usize;
        let r = (high - self.low) as usize;
        let last = self.n - 1;
        self.query_rec(1, 0, last, l, r)
    }

    fn update_rec(&mut self, node: usize, tl: usize, tr: usize, idx: usize, delta: f64) {
        if tl == tr {
            self.tree[node] += delta;
            return;
        }
        let tm = (tl + tr) / 2;
        if idx <= tm {
            self.update_rec(2 * node, tl, tm, idx, delta);
        } else {
            self.update_rec(2 * node + 1, tm + 1, tr, idx, delta);
        }
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1];
    }

    fn query_rec(&self, node: usize, tl: usize, tr: usize, l: usize, r: usize) -> f64 {
        if r < tl || tr < l {
            return 0.0;
        }
        if l <= tl && tr <= r {
            return self.tree[node];
        }
        let tm = (tl + tr) / 2;
        self.query_rec(2 * node, tl, tm, l, r) + self.query_rec(2 * node + 1, tm + 1, tr, l, r)
    }
}
