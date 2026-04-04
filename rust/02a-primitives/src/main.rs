fn main(){
    // Primitive types

    let logical: bool = true;

    let a_float: f64  = 1.0;
    let an_integer = 5i32;

    let default_float = 3.0;
    let default_integer = 7;

    let mut inferred_type = 12;
    let mut mutable = 12;
    mutable = 24;

    // Compount types

    let my_array: [i32; 5] = [1, 2, 3, 4, 5];
    let my_tuple = (5u32, 1u8, true, -5.04f32);
}