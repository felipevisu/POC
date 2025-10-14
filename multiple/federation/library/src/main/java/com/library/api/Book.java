package com.library.api;

public record Book(
    String id,
    String title,
    String author,
    int year,
    String isbn
) {}