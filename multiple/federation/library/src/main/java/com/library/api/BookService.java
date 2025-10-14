package com.library.api;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    private final List<Book> books = new ArrayList<>();

    public BookService() {
        // Initialize with some sample books
        books.add(new Book("1", "1984", "George Orwell", 1949, "978-0451524935"));
        books.add(new Book("2", "To Kill a Mockingbird", "Harper Lee", 1960, "978-0061120084"));
        books.add(new Book("3", "The Great Gatsby", "F. Scott Fitzgerald", 1925, "978-0743273565"));
        books.add(new Book("4", "Pride and Prejudice", "Jane Austen", 1813, "978-0141439518"));
        books.add(new Book("5", "The Catcher in the Rye", "J.D. Salinger", 1951, "978-0316769174"));
    }

    public List<Book> getAllBooks() {
        return new ArrayList<>(books);
    }

    public Optional<Book> getBookById(String id) {
        return books.stream()
                .filter(book -> book.id().equals(id))
                .findFirst();
    }

    public List<Book> getBooksByAuthor(String author) {
        return books.stream()
                .filter(book -> book.author().equalsIgnoreCase(author))
                .toList();
    }

    public Book addBook(String title, String author, int year, String isbn) {
        String id = String.valueOf(books.size() + 1);
        Book newBook = new Book(id, title, author, year, isbn);
        books.add(newBook);
        return newBook;
    }
}
