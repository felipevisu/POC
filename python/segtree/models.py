from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

Grade = Literal["A", "B", "C", "D", "E"]


@dataclass(frozen=True)
class LoanRequest:
    amount: float
    score: int
    term: int
    grade: Grade


@dataclass(frozen=True)
class Decision:
    status: Literal["approved", "rejected"]
    reason: str | None = None
    rate: float | None = None
    score_priority: int | None = None


@dataclass(frozen=True)
class RangeLimit:
    lo: int
    hi: int
    max_exposure: float
