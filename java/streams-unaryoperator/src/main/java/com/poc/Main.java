package com.poc;

import java.util.List;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;

public class Main {

    public static void main(String[] args) {
        // 1. Increment an integer
        UnaryOperator<Integer> increment = n -> n + 1;
        System.out.println("Increment: " + increment.apply(9));

        // 2. Negate an integer
        UnaryOperator<Integer> negate = n -> -n;
        System.out.println("Negate: " + negate.apply(42));

        // 3. Uppercase a string
        UnaryOperator<String> toUpper = String::toUpperCase;
        System.out.println("Upper: " + toUpper.apply("hello world"));

        // 4. Trim and normalize whitespace
        UnaryOperator<String> normalize = s -> s.trim().replaceAll("\\s+", " ");
        System.out.println("Normalized: '" + normalize.apply("  too   many   spaces  ") + "'");

        // 5. andThen: trim then uppercase
        UnaryOperator<String> trimThenUpper = normalize.andThen(String::toUpperCase)::apply;
        System.out.println("Trim+Upper: '" + trimThenUpper.apply("  hello  world  ") + "'");

        // 6. Applied to a list via replaceAll
        List<String> names = new java.util.ArrayList<>(List.of("alice", "bob", "carol"));
        names.replaceAll(toUpper);
        System.out.println("Names uppercased: " + names);

        // 7. UnaryOperator.identity — returns the input unchanged
        UnaryOperator<String> identity = UnaryOperator.identity();
        System.out.println("Identity: " + identity.apply("unchanged"));
    }
}
