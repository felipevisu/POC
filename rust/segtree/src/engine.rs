use std::collections::HashMap;

use crate::models::{Decision, Grade, LoanRequest, RangeLimit};
use crate::segtree::SegmentTree;

const SCORE_MIN: i64 = 300;
const SCORE_MAX: i64 = 850;
const TERM_MIN: i64 = 1;
const TERM_MAX: i64 = 84;

pub struct Strategy {
    pub score_limits: Vec<RangeLimit>,
    pub term_limits: Vec<RangeLimit>,
    pub grade_limits: HashMap<Grade, f64>,
    pub total_limit: Option<f64>,
    pub prefer_short_term_months: i64,
    pub min_score: i64,
    pub max_score: i64,
}

impl Default for Strategy {
    fn default() -> Self {
        Self {
            score_limits: Vec::new(),
            term_limits: Vec::new(),
            grade_limits: HashMap::new(),
            total_limit: None,
            prefer_short_term_months: 24,
            min_score: SCORE_MIN,
            max_score: SCORE_MAX,
        }
    }
}

pub struct DecisionEngine {
    pub strategy: Strategy,
    score_tree: SegmentTree,
    term_tree: SegmentTree,
    grade_map: HashMap<Grade, f64>,
    total_exposure: f64,
}

impl DecisionEngine {
    pub fn new(strategy: Strategy) -> Self {
        Self {
            strategy,
            score_tree: SegmentTree::new(SCORE_MIN, SCORE_MAX),
            term_tree: SegmentTree::new(TERM_MIN, TERM_MAX),
            grade_map: HashMap::new(),
            total_exposure: 0.0,
        }
    }

    pub fn total_exposure(&self) -> f64 {
        self.total_exposure
    }

    pub fn grade_map(&self) -> &HashMap<Grade, f64> {
        &self.grade_map
    }

    pub fn exposure_in_range(&self, dimension: &str, low: i64, high: i64) -> f64 {
        match dimension {
            "score" => self.score_tree.query(low, high),
            "term" => self.term_tree.query(low, high),
            other => panic!("unknown dimension: {other}"),
        }
    }

    pub fn evaluate(&mut self, req: LoanRequest) -> Decision {
        if req.score < self.strategy.min_score || req.score > self.strategy.max_score {
            return Decision::rejected(format!(
                "score {} outside eligible window",
                req.score
            ));
        }

        if let Some(total_limit) = self.strategy.total_limit {
            if self.total_exposure + req.amount > total_limit {
                return Decision::rejected("total portfolio limit exceeded");
            }
        }

        for limit in &self.strategy.score_limits {
            if limit.low <= req.score && req.score <= limit.high {
                let current = self.score_tree.query(limit.low, limit.high);
                if current + req.amount > limit.max_exposure {
                    return Decision::rejected(format!(
                        "score range {}-{} cap ${} would be breached",
                        limit.low,
                        limit.high,
                        format_amount(limit.max_exposure),
                    ));
                }
            }
        }

        for limit in &self.strategy.term_limits {
            if limit.low <= req.term && req.term <= limit.high {
                let current = self.term_tree.query(limit.low, limit.high);
                if current + req.amount > limit.max_exposure {
                    return Decision::rejected(format!(
                        "term range {}-{} cap ${} would be breached",
                        limit.low,
                        limit.high,
                        format_amount(limit.max_exposure),
                    ));
                }
            }
        }

        if let Some(&grade_cap) = self.strategy.grade_limits.get(&req.grade) {
            let current = *self.grade_map.get(&req.grade).unwrap_or(&0.0);
            if current + req.amount > grade_cap {
                return Decision::rejected(format!(
                    "grade {} cap ${} would be breached",
                    req.grade.as_str(),
                    format_amount(grade_cap),
                ));
            }
        }

        let priority = self.priority(&req);
        let rate = self.price(&req);
        self.commit(&req);
        Decision::approved(rate, priority)
    }

    fn commit(&mut self, req: &LoanRequest) {
        self.score_tree.update(req.score, req.amount);
        self.term_tree.update(req.term, req.amount);
        *self.grade_map.entry(req.grade).or_insert(0.0) += req.amount;
        self.total_exposure += req.amount;
    }

    fn priority(&self, req: &LoanRequest) -> i32 {
        let mut score = 0;
        if req.score >= 720 {
            score += 10;
        }
        if req.term <= self.strategy.prefer_short_term_months {
            score += 5;
        }
        if matches!(req.grade, Grade::D | Grade::E) {
            score -= 8;
        }
        score
    }

    fn price(&self, req: &LoanRequest) -> f64 {
        let base = match req.grade {
            Grade::A => 6.5,
            Grade::B => 9.0,
            Grade::C => 12.5,
            Grade::D => 16.0,
            Grade::E => 20.0,
        };
        let term_bump = if req.term > self.strategy.prefer_short_term_months { 0.5 } else { 0.0 };
        let score_discount = if req.score >= 720 { 1.0 } else { 0.0 };
        round2(base + term_bump - score_discount)
    }
}

fn round2(x: f64) -> f64 {
    (x * 100.0).round() / 100.0
}

fn format_amount(v: f64) -> String {
    // Integer dollars with thousands separators, matching Python's `{:,.0f}`.
    let rounded = v.round() as i64;
    let sign = if rounded < 0 { "-" } else { "" };
    let digits = rounded.abs().to_string();
    let bytes = digits.as_bytes();
    let mut out = String::with_capacity(bytes.len() + bytes.len() / 3);
    for (i, b) in bytes.iter().enumerate() {
        if i > 0 && (bytes.len() - i) % 3 == 0 {
            out.push(',');
        }
        out.push(*b as char);
    }
    format!("{sign}{out}")
}
