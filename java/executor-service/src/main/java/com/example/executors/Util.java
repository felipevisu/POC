package com.example.executors;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

final class Util {
    private static final DateTimeFormatter T = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");

    private Util() {}

    static void log(String message) {
        System.out.printf("  %s [%-22s] %s%n",
                LocalTime.now().format(T),
                Thread.currentThread().getName().isEmpty()
                        ? Thread.currentThread().toString()
                        : Thread.currentThread().getName(),
                message);
    }

    static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("interrupted", e);
        }
    }

    static void header(String title) {
        System.out.println("\n=== " + title + " ===");
    }
}
