fn main() {
    let x = 5;
    println!("x = {}", x);

    let mut y = 10;
    println!("y = {}", y);
    y = 20;
    println!("y = {}", y);

    let (a, b, c) = (1, 2.0, "three");
    println!("a = {}, b = {}, c = {}", a, b, c);

    let (mut p, q) = (5, 10);
    p += q;
    println!("p = {}, q = {}", p, q);

    let x = "hello";
    println!("x = {}", x);
    let x = x.len();
    println!("x = {}", x);

    let guess: i32 = "42".parse().unwrap();
    println!("guess = {}", guess);

    let _unused = 99;

    {
        let inner = 100;
        println!("inner = {}", inner);
    }

    let long_variable = {
        let x = 3;
        let y = 7;
        x + y
    };
    println!("long_variable = {}", long_variable);

    let condition = true;
    let number = if condition { 5 } else { 10 };
    println!("number = {}", number);

    let (first, .., last) = (1, 2, 3, 4, 5);
    println!("first = {}, last = {}", first, last);

    let ref_x = &42;
    println!("ref_x = {}", ref_x);

    let point = (3.0, 4.0);
    let (ref x, ref y) = point;
    println!("x = {}, y = {}", x, y);
}
