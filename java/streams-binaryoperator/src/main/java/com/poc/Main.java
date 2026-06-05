package com.poc;

import java.util.function.BinaryOperator;

public class Main {

    public static void main(String[] args) {
        // 1. Sum of two integers
        BinaryOperator<Integer> sum = (a, b) -> a + b;
        System.out.println("Sum: " + sum.apply(10, 5));

        // 2. Multiplication
        BinaryOperator<Integer> multiply = (a, b) -> a * b;
        System.out.println("Multiply: " + multiply.apply(6, 7));

        // 3. String concatenation
        BinaryOperator<String> concat = (s1, s2) -> s1 + " " + s2;
        System.out.println("Concat: " + concat.apply("Hello", "World"));

        // 4. Max of two integers using BinaryOperator.maxBy
        BinaryOperator<Integer> max = BinaryOperator.maxBy(Integer::compareTo);
        System.out.println("Max: " + max.apply(42, 17));

        // 5. Min of two strings (lexicographic)
        BinaryOperator<String> minString = BinaryOperator.minBy(String::compareTo);
        System.out.println("Min string: " + minString.apply("banana", "apple"));

        // 6. Chaining: (a + b) * 2 using andThen via Function
        BinaryOperator<Integer> sumThenDouble = (a, b) -> (a + b) * 2;
        System.out.println("Sum then double: " + sumThenDouble.apply(3, 4));
    }
}
