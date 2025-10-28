package com.example.Command.userSystem.demos;

import com.example.Command.userSystem.*;

public class BasicDemo {
    public static void main(String[] args) {
        // Setup
        UserRepository userRepository = new UserRepository();
        NotificationService notificationService = new NotificationService();
        CommandProcessor processor = new CommandProcessor();

        // Create commands
        User newUser = new User("John Doe", "john@example.com");
        Command createUserCmd = new CreateUserCommand(newUser, userRepository);
        Command notifyCmd = new SendNotificationCommand(
                notificationService, "admin@example.com", "New user registered"
        );

        // Queue and execute commands
        processor.addCommand(createUserCmd);
        processor.addCommand(notifyCmd);
        processor.executeAll();

        // Undo operations
        System.out.println("\n--- Undoing operations ---");
        processor.undoAll();

        processor.shutdown();
    }
}
