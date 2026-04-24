use std::collections::HashMap;

use segtree::{DecisionEngine, Grade, LoanRequest, RangeLimit, SegmentTree, Status, Strategy};

#[test]
fn segtree_basic_sum() {
    let mut st = SegmentTree::new(0, 9);
    st.update(3, 10.0);
    st.update(5, 20.0);
    st.update(8, 5.0);
    assert_eq!(st.query(0, 9), 35.0);
    assert_eq!(st.query(3, 5), 30.0);
    assert_eq!(st.query(6, 9), 5.0);
    assert_eq!(st.query(0, 2), 0.0);
}

#[test]
fn segtree_point_updates_accumulate() {
    let mut st = SegmentTree::new(100, 200);
    st.update(150, 7.0);
    st.update(150, 3.0);
    assert_eq!(st.query(150, 150), 10.0);
    assert_eq!(st.query(100, 200), 10.0);
}

#[test]
fn segtree_clamps_out_of_range_query() {
    let mut st = SegmentTree::new(300, 400);
    st.update(350, 99.0);
    assert_eq!(st.query(0, 1000), 99.0);
}

#[test]
fn engine_approves_within_limits() {
    let mut grade_limits = HashMap::new();
    grade_limits.insert(Grade::C, 5_000_000.0);

    let strategy = Strategy {
        score_limits: vec![RangeLimit::new(600, 650, 3_000_000.0)],
        grade_limits,
        total_limit: Some(10_000_000.0),
        ..Strategy::default()
    };

    let mut engine = DecisionEngine::new(strategy);
    let d = engine.evaluate(LoanRequest::new(100_000.0, 640, 36, Grade::C));
    assert_eq!(d.status, Status::Approved);
    assert_eq!(engine.exposure_in_range("score", 600, 650), 100_000.0);
}

#[test]
fn engine_rejects_on_range_cap() {
    let strategy = Strategy {
        score_limits: vec![RangeLimit::new(600, 650, 200_000.0)],
        ..Strategy::default()
    };
    let mut engine = DecisionEngine::new(strategy);
    assert_eq!(
        engine.evaluate(LoanRequest::new(150_000.0, 625, 36, Grade::C)).status,
        Status::Approved
    );
    let rejected = engine.evaluate(LoanRequest::new(100_000.0, 640, 36, Grade::C));
    assert_eq!(rejected.status, Status::Rejected);
    assert!(rejected.reason.as_deref().unwrap().contains("score range"));
}

#[test]
fn engine_rejects_on_grade_cap() {
    let mut grade_limits = HashMap::new();
    grade_limits.insert(Grade::E, 100_000.0);
    let strategy = Strategy { grade_limits, ..Strategy::default() };

    let mut engine = DecisionEngine::new(strategy);
    assert_eq!(
        engine.evaluate(LoanRequest::new(80_000.0, 500, 36, Grade::E)).status,
        Status::Approved
    );
    let rejected = engine.evaluate(LoanRequest::new(50_000.0, 500, 36, Grade::E));
    assert_eq!(rejected.status, Status::Rejected);
    assert!(rejected.reason.as_deref().unwrap().contains("grade E"));
}

#[test]
fn engine_rejects_on_total_cap() {
    let strategy = Strategy { total_limit: Some(200_000.0), ..Strategy::default() };
    let mut engine = DecisionEngine::new(strategy);
    engine.evaluate(LoanRequest::new(150_000.0, 700, 12, Grade::A));
    let rejected = engine.evaluate(LoanRequest::new(100_000.0, 700, 12, Grade::A));
    assert_eq!(rejected.status, Status::Rejected);
    assert!(rejected.reason.as_deref().unwrap().contains("total portfolio"));
}
