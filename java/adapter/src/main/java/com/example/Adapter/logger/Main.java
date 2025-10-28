package com.example.Adapter.logger;

public class Main {
    public static void main(String[] args) {
        NewLogger newLogger = new NewLogger();
        Logger loggerAdapter = new LoggerAdapter(newLogger);

        UserService userService = new UserService(loggerAdapter);
        userService.createUser("felipefaria");
    }
}