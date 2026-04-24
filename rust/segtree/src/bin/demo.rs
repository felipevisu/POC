use std::collections::HashMap;

use segtree::{DecisionEngine, Grade, LoanRequest, RangeLimit, Status, Strategy};

fn build_strategy() -> Strategy {
    let mut grade_limits = HashMap::new();
    grade_limits.insert(Grade::A, 10_000_000.0);
    grade_limits.insert(Grade::B, 7_000_000.0);
    grade_limits.insert(Grade::C, 5_000_000.0);
    grade_limits.insert(Grade::D, 2_000_000.0);
    grade_limits.insert(Grade::E, 500_000.0);

    Strategy {
        score_limits: vec![
            RangeLimit::new(300, 599, 500_000.0),
            RangeLimit::new(600, 650, 3_000_000.0),
            RangeLimit::new(651, 720, 5_000_000.0),
            RangeLimit::new(721, 850, 10_000_000.0),
        ],
        term_limits: vec![
            RangeLimit::new(1, 24, 8_000_000.0),
            RangeLimit::new(25, 60, 6_000_000.0),
            RangeLimit::new(61, 84, 2_000_000.0),
        ],
        grade_limits,
        total_limit: Some(20_000_000.0),
        ..Strategy::default()
    }
}

fn fmt_money(v: f64) -> String {
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

fn main() {
    let mut engine = DecisionEngine::new(build_strategy());

    let pipeline = [
        LoanRequest::new(100_000.0, 720, 36, Grade::A),
        LoanRequest::new(50_000.0, 640, 24, Grade::C),
        LoanRequest::new(2_900_000.0, 625, 36, Grade::C),
        LoanRequest::new(200_000.0, 630, 36, Grade::C),
        LoanRequest::new(250_000.0, 580, 36, Grade::E),
        LoanRequest::new(500_000.0, 800, 12, Grade::A),
    ];

    for req in pipeline {
        let decision = engine.evaluate(req);
        let status = decision.status.as_str().to_uppercase();
        let tail = match decision.status {
            Status::Approved => format!(
                "rate={}% priority={}",
                decision.rate.unwrap(),
                decision.score_priority.unwrap()
            ),
            Status::Rejected => decision.reason.clone().unwrap_or_default(),
        };
        println!(
            "[{}] ${:>10} score={} term={} grade={} -> {}",
            status,
            fmt_money(req.amount),
            req.score,
            req.term,
            req.grade.as_str(),
            tail,
        );
    }

    println!();
    println!("Total exposure: ${}", fmt_money(engine.total_exposure()));
    println!("Score buckets:");
    for (low, high) in [(300, 599), (600, 650), (651, 720), (721, 850)] {
        println!(
            "  {low}-{high}: ${}",
            fmt_money(engine.exposure_in_range("score", low, high))
        );
    }
    let by_grade: Vec<_> = engine
        .grade_map()
        .iter()
        .map(|(g, v)| format!("{}: ${}", g.as_str(), fmt_money(*v)))
        .collect();
    println!("Grade exposure: {{{}}}", by_grade.join(", "));
}
