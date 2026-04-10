type Kilometers = i32;
type Pair = (i32, i32);

fn distance(a: Pair, b: Pair) -> f64 {
    let dx = (b.0 - a.0) as f64;
    let dy = (b.1 - a.1) as f64;
    (dx * dx + dy * dy).sqrt()
}

fn main() {
    let integer: i32 = 42;
    let float: f64 = 3.14;
    let boolean: bool = true;
    let character: char = 'R';
    println!("{} {} {} {}", integer, float, boolean, character);

    let _i8: i8 = -128;
    let _i16: i16 = -32_768;
    let _i32: i32 = -2_147_483_648;
    let _i64: i64 = -9_223_372_036_854_775_808;
    let _i128: i128 = -170_141_183_460_469_231_731_687_303_715_884_105_728;

    let _u8: u8 = 255;
    let _u16: u16 = 65_535;
    let _u32: u32 = 4_294_967_295;
    let _u64: u64 = 18_446_744_073_709_551_615;

    let _f32: f32 = 3.14;
    let _f64: f64 = 3.141592653589793;

    let _isize: isize = 100;
    let _usize: usize = 100;
    println!("isize size: {} bytes", std::mem::size_of::<isize>());
    println!("usize size: {} bytes", std::mem::size_of::<usize>());

    let hex = 0xff;
    let octal = 0o77;
    let binary = 0b1010;
    let byte = b'A';
    println!("hex={} octal={} binary={} byte={}", hex, octal, binary, byte);

    let x: i32 = 65;
    let y: f64 = x as f64;
    let z: char = x as u8 as char;
    println!("{} -> {} -> '{}'", x, y, z);

    let big: i64 = 1_000_000;
    let small: i8 = big as i8;
    println!("truncation: {} -> {}", big, small);

    let d: Kilometers = 5;
    let total: Kilometers = d + 10;
    println!("distance: {} km", total);

    let p1: Pair = (0, 0);
    let p2: Pair = (3, 4);
    println!("distance between points: {:.2}", distance(p1, p2));

    let s1: &str = "hello";
    let s2: String = String::from("world");
    let s3: String = format!("{} {}", s1, s2);
    println!("{}", s3);

    let arr: [i32; 5] = [1, 2, 3, 4, 5];
    let slice: &[i32] = &arr[1..4];
    println!("arr={:?} slice={:?}", arr, slice);

    let unit: () = ();
    println!("unit: {:?}", unit);

    let never_none: Option<i32> = Some(10);
    let always_none: Option<i32> = None;
    println!("some={:?} none={:?}", never_none, always_none);

    let ok: Result<i32, String> = Ok(200);
    let err: Result<i32, String> = Err(String::from("not found"));
    println!("ok={:?} err={:?}", ok, err);

    let boxed: Box<i32> = Box::new(42);
    println!("boxed={} size={}", boxed, std::mem::size_of_val(&boxed));
    println!("i32 size={}", std::mem::size_of::<i32>());
}
