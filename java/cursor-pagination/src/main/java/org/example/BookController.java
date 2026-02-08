package org.example;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/books")
public class BookController {

    @GetMapping
    public List<Book> getBooks(){
        return  List.of(new Book(1L, "Pride and Prejudice", "Jane Austen"));
    }
}
