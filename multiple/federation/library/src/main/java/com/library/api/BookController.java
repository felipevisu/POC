package com.library.api;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @QueryMapping
    public List<Book> books() {
        return bookService.getAllBooks();
    }

    @QueryMapping
    public Book bookById(@Argument String id) {
        return bookService.getBookById(id).orElse(null);
    }

    @QueryMapping
    public List<Book> booksByAuthor(@Argument String author) {
        return bookService.getBooksByAuthor(author);
    }

    @QueryMapping
    public List<Book> _entities(@Argument List<Map<String, Object>> representations) {
        return representations.stream()
                .map(r -> bookService.getBookById((String) r.get("id")).orElse(null))
                .toList();
    }

    @QueryMapping
    public Map<String, String> _service() {
        return Map.of("sdl", """
            type Book @key(fields: "id") {
                id: ID!
                title: String
                author: String
                year: Int
                isbn: String
            }
        """);
    }

    @MutationMapping
    public Book addBook(@Argument String title,
                        @Argument String author,
                        @Argument int year,
                        @Argument String isbn) {
        return bookService.addBook(title, author, year, isbn);
    }
}
