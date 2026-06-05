package com.poc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.function.Supplier;

public class Main {

    public static void main(String[] args) {
        // 1. Supplier that returns the current date/time
        Supplier<LocalDateTime> now = LocalDateTime::now;
        System.out.println("Current time: " + now.get());

        // 2. Supplier that generates a random integer
        Random random = new Random();
        Supplier<Integer> randomInt = () -> random.nextInt(100);
        System.out.println("Random number: " + randomInt.get());

        // 3. Supplier for lazy initialization of a UUID
        Supplier<String> idGenerator = () -> UUID.randomUUID().toString();
        System.out.println("Generated ID: " + idGenerator.get());

        // 4. Supplier used to provide default values
        String nullableValue = null;
        Supplier<String> defaultValue = () -> "default";
        String result = nullableValue != null ? nullableValue : defaultValue.get();
        System.out.println("Resolved value: " + result);

        // 5. Supplier producing a fresh list each time
        Supplier<List<String>> listFactory = java.util.ArrayList::new;
        List<String> list1 = listFactory.get();
        List<String> list2 = listFactory.get();
        list1.add("hello");
        System.out.println("list1: " + list1 + ", list2 (independent): " + list2);
    }
}
