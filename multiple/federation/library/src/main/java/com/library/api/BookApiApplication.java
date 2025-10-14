package com.library.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BookApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookApiApplication.class, args);
        System.out.println("GraphQL API is running!");
        System.out.println("GraphiQL UI: http://localhost:8080/graphiql");
        System.out.println("GraphQL endpoint: http://localhost:8080/graphql");
    }
}
