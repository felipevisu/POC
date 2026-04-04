fn reverse(pair: (i32, bool)) -> (bool, i32) {
    let (int_param, bool_param) = pair;
    (bool_param, int_param)
}

struct Matrix(f32, f32, f32, f32);

fn main() {
    let pair = (1, true);
    println!("Pair is {:?}", pair);

    let reversed_pair = reverse(pair);
    println!("Reversed pair is {:?}", reversed_pair);

    let matrix = Matrix(1.1, 1.2, 2.1, 2.2);
    println!("{:?}", matrix);
}