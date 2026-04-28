from __future__ import annotations

from engine import DecisionEngine, Strategy
from models import LoanRequest, RangeLimit


def build_strategy() -> Strategy:
    return Strategy(
        score_limits=[
            RangeLimit(300, 599, 500_000),
            RangeLimit(600, 650, 3_000_000),
            RangeLimit(651, 720, 5_000_000),
            RangeLimit(721, 850, 10_000_000),
        ],
        term_limits=[
            RangeLimit(1, 24, 8_000_000),
            RangeLimit(25, 60, 6_000_000),
            RangeLimit(61, 84, 2_000_000),
        ],
        grade_limits={"A": 10_000_000, "B": 7_000_000, "C": 5_000_000, "D": 2_000_000, "E": 500_000},
        total_limit=20_000_000,
    )


def run() -> None:
    engine = DecisionEngine(build_strategy())

    pipeline: list[LoanRequest] = [
        LoanRequest(amount=100_000, score=720, term=36, grade="A"),
        LoanRequest(amount=50_000, score=640, term=24, grade="C"),
        LoanRequest(amount=2_900_000, score=625, term=36, grade="C"),
        LoanRequest(amount=200_000, score=630, term=36, grade="C"),
        LoanRequest(amount=250_000, score=580, term=36, grade="E"),
        LoanRequest(amount=500_000, score=800, term=12, grade="A"),
    ]

    for req in pipeline:
        decision = engine.evaluate(req)
        status = decision.status.upper()
        tail = decision.reason if decision.status == "rejected" else f"rate={decision.rate}% priority={decision.score_priority}"
        print(f"[{status}] ${req.amount:>10,.0f} score={req.score} term={req.term} grade={req.grade} -> {tail}")

    print()
    print(f"Total exposure: ${engine.total_exposure:,.0f}")
    print("Score buckets:")
    for lo, hi in [(300, 599), (600, 650), (651, 720), (721, 850)]:
        print(f"  {lo}-{hi}: ${engine.exposure_in_range('score', lo, hi):,.0f}")
    print("Grade exposure:", {g: f"${v:,.0f}" for g, v in engine.grade_map.items()})


if __name__ == "__main__":
    run()
