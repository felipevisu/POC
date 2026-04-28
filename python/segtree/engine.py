from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field

from models import Decision, Grade, LoanRequest, RangeLimit
from segtree import SegmentTree

SCORE_MIN, SCORE_MAX = 300, 850
TERM_MIN, TERM_MAX = 1, 84


@dataclass
class Strategy:
    score_limits: list[RangeLimit] = field(default_factory=list)
    term_limits: list[RangeLimit] = field(default_factory=list)
    grade_limits: dict[Grade, float] = field(default_factory=dict)
    total_limit: float | None = None
    prefer_short_term_months: int = 24
    min_score: int = SCORE_MIN
    max_score: int = SCORE_MAX


class DecisionEngine:
    def __init__(self, strategy: Strategy):
        self.strategy = strategy
        self.score_tree = SegmentTree(SCORE_MIN, SCORE_MAX)
        self.term_tree = SegmentTree(TERM_MIN, TERM_MAX)
        self.grade_map: dict[Grade, float] = defaultdict(float)
        self.total_exposure: float = 0.0

    def evaluate(self, req: LoanRequest) -> Decision:
        if req.score < self.strategy.min_score or req.score > self.strategy.max_score:
            return Decision(
                "rejected", reason=f"score {req.score} outside eligible window"
            )

        if self.strategy.total_limit is not None:
            if self.total_exposure + req.amount > self.strategy.total_limit:
                return Decision("rejected", reason="total portfolio limit exceeded")

        for limit in self.strategy.score_limits:
            if limit.lo <= req.score <= limit.hi:
                current = self.score_tree.query(limit.lo, limit.hi)
                if current + req.amount > limit.max_exposure:
                    return Decision(
                        "rejected",
                        reason=f"score range {limit.lo}-{limit.hi} cap ${limit.max_exposure:,.0f} would be breached",
                    )

        for limit in self.strategy.term_limits:
            if limit.lo <= req.term <= limit.hi:
                current = self.term_tree.query(limit.lo, limit.hi)
                if current + req.amount > limit.max_exposure:
                    return Decision(
                        "rejected",
                        reason=f"term range {limit.lo}-{limit.hi} cap ${limit.max_exposure:,.0f} would be breached",
                    )

        grade_cap = self.strategy.grade_limits.get(req.grade)
        if grade_cap is not None and self.grade_map[req.grade] + req.amount > grade_cap:
            return Decision(
                "rejected",
                reason=f"grade {req.grade} cap ${grade_cap:,.0f} would be breached",
            )

        priority = self._priority(req)
        rate = self._price(req)
        self._commit(req)
        return Decision("approved", rate=rate, score_priority=priority)

    def exposure_in_range(self, dimension: str, lo: int, hi: int) -> float:
        if dimension == "score":
            return self.score_tree.query(lo, hi)
        if dimension == "term":
            return self.term_tree.query(lo, hi)
        raise ValueError(f"unknown dimension: {dimension}")

    def grade_exposure(self, grade: Grade) -> float:
        return self.grade_map[grade]

    def _commit(self, req: LoanRequest) -> None:
        self.score_tree.update(req.score, req.amount)
        self.term_tree.update(req.term, req.amount)
        self.grade_map[req.grade] += req.amount
        self.total_exposure += req.amount

    def _priority(self, req: LoanRequest) -> int:
        score = 0
        if req.score >= 720:
            score += 10
        if req.term <= self.strategy.prefer_short_term_months:
            score += 5
        if req.grade in ("D", "E"):
            score -= 8
        return score

    def _price(self, req: LoanRequest) -> float:
        base = {"A": 6.5, "B": 9.0, "C": 12.5, "D": 16.0, "E": 20.0}[req.grade]
        term_bump = 0.5 if req.term > self.strategy.prefer_short_term_months else 0.0
        score_discount = 1.0 if req.score >= 720 else 0.0
        return round(base + term_bump - score_discount, 2)
