package main.java.com.library;


public record Book(
    String id,
    String title,
    String author,
    int year,
    String isbn
) {}