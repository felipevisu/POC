package com.poc;

import java.util.List;
import java.util.function.Consumer;

public class Main {

    public static void main(String[] args) {
        // 1. Consumer that prints a message
        Consumer<String> printer = message -> System.out.println(">> " + message);
        printer.accept("Hello, Consumer!");

        // 2. Consumer that converts and prints a number
        Consumer<Integer> squarePrinter = n -> System.out.println(n + " squared = " + (n * n));
        squarePrinter.accept(7);

        // 3. andThen: chaining two consumers
        Consumer<String> upperCasePrinter = s -> System.out.println("Upper: " + s.toUpperCase());
        Consumer<String> lowerCasePrinter = s -> System.out.println("Lower: " + s.toLowerCase());
        Consumer<String> combined = upperCasePrinter.andThen(lowerCasePrinter);
        combined.accept("Java Functional");

        // 4. Consumer used in forEach
        List<String> fruits = List.of("Apple", "Banana", "Cherry");
        Consumer<String> fruitPrinter = fruit -> System.out.println("Fruit: " + fruit);
        fruits.forEach(fruitPrinter);

        // 5. Consumer that mutates an object
        List<String> mutableList = new java.util.ArrayList<>();
        Consumer<String> addToList = mutableList::add;
        List.of("one", "two", "three").forEach(addToList);
        System.out.println("Collected: " + mutableList);
    }
}
