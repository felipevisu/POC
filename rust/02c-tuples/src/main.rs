fn reverse(pair: (i32, bool)) -> (bool, i32) {
    let (int_param, bool_param) = pair;
    (bool_param, int_param)
}

fn main() {
    let pair = (1, true);
    println!("Pair is {:?}", pair);

    let reversed_pair = reverse(pair);
    println!("Reversed pair is {:?}", reversed_pair);
}