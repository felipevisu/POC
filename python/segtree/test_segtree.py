from engine import DecisionEngine, Strategy
from models import LoanRequest, RangeLimit
from segtree import SegmentTree


def test_segtree_basic_sum():
    st = SegmentTree(0, 9)
    st.update(3, 10)
    st.update(5, 20)
    st.update(8, 5)
    assert st.query(0, 9) == 35
    assert st.query(3, 5) == 30
    assert st.query(6, 9) == 5
    assert st.query(0, 2) == 0


def test_segtree_point_updates_accumulate():
    st = SegmentTree(100, 200)
    st.update(150, 7)
    st.update(150, 3)
    assert st.query(150, 150) == 10
    assert st.query(100, 200) == 10


def test_segtree_clamps_out_of_range_query():
    st = SegmentTree(300, 400)
    st.update(350, 99)
    assert st.query(0, 1000) == 99


def test_engine_approves_within_limits():
    s = Strategy(
        score_limits=[RangeLimit(600, 650, 3_000_000)],
        grade_limits={"C": 5_000_000},
        total_limit=10_000_000,
    )
    engine = DecisionEngine(s)
    d = engine.evaluate(LoanRequest(100_000, 640, 36, "C"))
    assert d.status == "approved"
    assert engine.exposure_in_range("score", 600, 650) == 100_000


def test_engine_rejects_on_range_cap():
    s = Strategy(score_limits=[RangeLimit(600, 650, 200_000)])
    engine = DecisionEngine(s)
    assert engine.evaluate(LoanRequest(150_000, 625, 36, "C")).status == "approved"
    rejected = engine.evaluate(LoanRequest(100_000, 640, 36, "C"))
    assert rejected.status == "rejected"
    assert "score range" in rejected.reason


def test_engine_rejects_on_grade_cap():
    s = Strategy(grade_limits={"E": 100_000})
    engine = DecisionEngine(s)
    assert engine.evaluate(LoanRequest(80_000, 500, 36, "E")).status == "approved"
    rejected = engine.evaluate(LoanRequest(50_000, 500, 36, "E"))
    assert rejected.status == "rejected"
    assert "grade E" in rejected.reason


def test_engine_rejects_on_total_cap():
    s = Strategy(total_limit=200_000)
    engine = DecisionEngine(s)
    engine.evaluate(LoanRequest(150_000, 700, 12, "A"))
    rejected = engine.evaluate(LoanRequest(100_000, 700, 12, "A"))
    assert rejected.status == "rejected"
    assert "total portfolio" in rejected.reason
