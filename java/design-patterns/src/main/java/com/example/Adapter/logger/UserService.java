package com.example.Adapter.logger;

public class UserService {
    private final Logger logger;

    public UserService(Logger logger) {
        this.logger = logger;
    }

    public void createUser(String username) {
        logger.log("User created: " + username);
    }
}
