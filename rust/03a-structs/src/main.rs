struct Point {
    x: f32,
    y: f32,
}

struct Rectangle {
    top_left: Point,
    bottom_right: Point,
}

fn area(rec: Rectangle) -> f32 {
    let x = rec.bottom_right.x - rec.top_left.x;
    let y = rec.bottom_right.y - rec.top_left.y;
    x * y
}

fn main() {
    let top_left: Point = Point { x: 5.2, y: 0.4 };
    let bottom_right: Point = Point { x: 10.3, y: 2.4 };

    let rectangle: Rectangle = Rectangle { top_left: top_left, bottom_right: bottom_right };

    println!("{}", rectangle.top_left.x);
    println!("{}", rectangle.top_left.y);
    println!("{}", rectangle.bottom_right.x);
    println!("{}", rectangle.bottom_right.y);

    println!("Rectangle area: {}", area(rectangle));
}