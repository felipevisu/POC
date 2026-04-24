#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub enum Grade {
    A,
    B,
    C,
    D,
    E,
}

impl Grade {
    pub fn as_str(self) -> &'static str {
        match self {
            Grade::A => "A",
            Grade::B => "B",
            Grade::C => "C",
            Grade::D => "D",
            Grade::E => "E",
        }
    }
}

#[derive(Clone, Copy)]
pub struct LoanRequest {
    pub amount: f64,
    pub score: i64,
    pub term: i64,
    pub grade: Grade,
}

impl LoanRequest {
    pub fn new(amount: f64, score: i64, term: i64, grade: Grade) -> Self {
        Self { amount, score, term, grade }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Approved,
    Rejected,
}

impl Status {
    pub fn as_str(self) -> &'static str {
        match self {
            Status::Approved => "approved",
            Status::Rejected => "rejected",
        }
    }
}

pub struct Decision {
    pub status: Status,
    pub reason: Option<String>,
    pub rate: Option<f64>,
    pub score_priority: Option<i32>,
}

impl Decision {
    pub fn approved(rate: f64, priority: i32) -> Self {
        Self {
            status: Status::Approved,
            reason: None,
            rate: Some(rate),
            score_priority: Some(priority),
        }
    }

    pub fn rejected(reason: impl Into<String>) -> Self {
        Self {
            status: Status::Rejected,
            reason: Some(reason.into()),
            rate: None,
            score_priority: None,
        }
    }
}

pub struct RangeLimit {
    pub low: i64,
    pub high: i64,
    pub max_exposure: f64,
}

impl RangeLimit {
    pub fn new(low: i64, high: i64, max_exposure: f64) -> Self {
        Self { low, high, max_exposure }
    }
}
