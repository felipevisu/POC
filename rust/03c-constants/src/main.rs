const MAX_CONNECTIONS: u32 = 100;
const PI: f64 = 3.14159265;
const APP_NAME: &str = "MyApp";

static LANGUAGE: &str = "Rust";
static mut REQUEST_COUNT: u32 = 0;

fn main() {
    println!("App: {}", APP_NAME);
    println!("Max connections: {}", MAX_CONNECTIONS);
    println!("PI: {}", PI);
    println!("Language: {}", LANGUAGE);

    unsafe {
        REQUEST_COUNT += 1;
        REQUEST_COUNT += 1;
        println!("Request count: {}", REQUEST_COUNT);
    }

    let x = 5;

    let mut y = 5;
    println!("y = {}", y);
    y = 10;
    println!("y = {}", y);

    let z = 10;
    let z = z + 5;
    let z = z * 2;
    println!("z = {}", z);

    let spaces = "   ";
    let spaces = spaces.len();
    println!("spaces = {}", spaces);
}
