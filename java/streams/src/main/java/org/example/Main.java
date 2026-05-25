package org.example;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    static void main() {
        List<Person> people = List.of(
            new Person("Alice", 34),
            new Person("Bob", 28),
            new Person("Carol", 42),
            new Person("Dave", 19),
            new Person("Eve", 31)
        );

        // Find users older than 30 years
        List<String> result = people.stream()
                .filter(p -> p.age > 30)
                .map(p -> p.name)
                .sorted()
                .collect(Collectors.toList());

        System.out.println(result);

        // Find users whose name starts with vowel
        List<Character> vowels = Arrays.asList('a', 'e', 'i', 'o', 'u');
        List<String> nameStartWithVowel = people.stream()
                .filter(p -> vowels.contains(p.name.toLowerCase().charAt(0)))
                .map(p -> p.name)
                .sorted()
                .collect(Collectors.toList());

        System.out.println(nameStartWithVowel);

        // Get average age
        double avgAge = people.stream()
                .mapToInt(p -> p.age)
                .average()
                .orElse(0);
        System.out.println(avgAge);

        // Cound adults
        double adultsCount = people.stream()
                .filter(p -> p.age >= 18)
                .count();
        System.out.println(adultsCount);

        // Join names
        String names = people.stream()
                .map(p -> p.name)
                .collect(Collectors.joining(", "));
        System.out.println(names);

        // Without Stream

        List<String> result2 = new ArrayList<>();
        for (Person p : people) {
            if (p.age > 30) {
                result2.add(p.name);
            }
        }
        Collections.sort(result2);
        System.out.println(result2);
    }
}
