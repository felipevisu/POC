enum Direction {
    North,
    South,
    East,
    West,
}

enum Shape {
    Circle(f64),
    Rectangle(f64, f64),
    Triangle { base: f64, height: f64 },
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(radius) => std::f64::consts::PI * radius * radius,
        Shape::Rectangle(width, height) => width * height,
        Shape::Triangle { base, height } => 0.5 * base * height,
    }
}

fn describe_direction(dir: &Direction) -> &str {
    match dir {
        Direction::North => "Going north",
        Direction::South => "Going south",
        Direction::East => "Going east",
        Direction::West => "Going west",
    }
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

impl Coin {
    fn value(&self) -> u32 {
        match self {
            Coin::Penny => 1,
            Coin::Nickel => 5,
            Coin::Dime => 10,
            Coin::Quarter => 25,
        }
    }
}

fn main() {
    let dir = Direction::North;
    println!("{}", describe_direction(&dir));

    let shapes = [
        Shape::Circle(5.0),
        Shape::Rectangle(4.0, 6.0),
        Shape::Triangle { base: 3.0, height: 8.0 },
    ];

    for shape in &shapes {
        println!("Area: {:.2}", area(shape));
    }

    let coins = [Coin::Penny, Coin::Nickel, Coin::Dime, Coin::Quarter];
    let total: u32 = coins.iter().map(|c| c.value()).sum();
    println!("Total: {} cents", total);

    let some_number: Option<i32> = Some(42);
    let no_number: Option<i32> = None;

    if let Some(n) = some_number {
        println!("Got a number: {}", n);
    }

    if let None = no_number {
        println!("No number here");
    }
}
