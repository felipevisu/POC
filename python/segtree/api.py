from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

from engine import DecisionEngine, Strategy
from models import Grade, LoanRequest, RangeLimit

app = FastAPI(title="Real-Time Loan Investment Engine")

strategy = Strategy(
    score_limits=[
        RangeLimit(lo=300, hi=599, max_exposure=500_000),
        RangeLimit(lo=600, hi=650, max_exposure=3_000_000),
        RangeLimit(lo=651, hi=720, max_exposure=5_000_000),
        RangeLimit(lo=721, hi=850, max_exposure=10_000_000),
    ],
    term_limits=[
        RangeLimit(lo=1, hi=24, max_exposure=8_000_000),
        RangeLimit(lo=25, hi=60, max_exposure=6_000_000),
        RangeLimit(lo=61, hi=84, max_exposure=2_000_000),
    ],
    grade_limits={"A": 10_000_000, "B": 7_000_000, "C": 5_000_000, "D": 2_000_000, "E": 500_000},
    total_limit=20_000_000,
)
engine = DecisionEngine(strategy)


class LoanRequestBody(BaseModel):
    amount: float = Field(gt=0)
    score: int = Field(ge=300, le=850)
    term: int = Field(ge=1, le=84)
    grade: Grade


class ExposureQuery(BaseModel):
    dimension: str
    lo: int
    hi: int


@app.post("/loans/decide")
def decide(body: LoanRequestBody):
    req = LoanRequest(amount=body.amount, score=body.score, term=body.term, grade=body.grade)
    decision = engine.evaluate(req)
    return {
        "status": decision.status,
        "reason": decision.reason,
        "rate": decision.rate,
        "score_priority": decision.score_priority,
    }


@app.post("/portfolio/exposure")
def exposure(body: ExposureQuery):
    return {"exposure": engine.exposure_in_range(body.dimension, body.lo, body.hi)}


@app.get("/portfolio/summary")
def summary():
    return {
        "total_exposure": engine.total_exposure,
        "by_grade": dict(engine.grade_map),
        "score_buckets": {
            "300-599": engine.exposure_in_range("score", 300, 599),
            "600-650": engine.exposure_in_range("score", 600, 650),
            "651-720": engine.exposure_in_range("score", 651, 720),
            "721-850": engine.exposure_in_range("score", 721, 850),
        },
        "term_buckets": {
            "1-24": engine.exposure_in_range("term", 1, 24),
            "25-60": engine.exposure_in_range("term", 25, 60),
            "61-84": engine.exposure_in_range("term", 61, 84),
        },
    }
