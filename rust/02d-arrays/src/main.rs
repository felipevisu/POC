fn main(){
    // fixed size
    let xs: [i32; 5] = [1,2,3,4,5];

    // initialize all elements with the same value
    let ys: [i32; 100] = [0; 100];

    println!("xs: {:?}", xs);
    println!("ys: {:?}", ys);

    for i in 0..xs.len() + 1 {
        match xs.get(i) {
            Some(xval) => println!("{}: {}", i, xval),
            None => println!("To big, out fo index: {}", i)
        }
    }
}