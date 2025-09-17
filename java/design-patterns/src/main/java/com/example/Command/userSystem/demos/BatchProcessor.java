package com.example.Command.userSystem.demos;

import com.example.Command.userSystem.*;

import java.util.List;

public class BatchProcessor {
    private final CommandProcessor commandProcessor;
    // Injectables for testability
    private UserRepository userRepository;
    private NotificationService notificationService;

    public BatchProcessor() {
        this.commandProcessor = new CommandProcessor();
    }

    // Extra constructor to allow injecting dependencies in tests/demos
    public BatchProcessor(CommandProcessor commandProcessor,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.commandProcessor = commandProcessor;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public void processBatch(List<User> users) {
        UserRepository userRepository = (this.userRepository != null)
                ? this.userRepository
                : new UserRepository();
        NotificationService notificationService = (this.notificationService != null)
                ? this.notificationService
                : new NotificationService();

        for (User user : users) {
            Command createCmd = new CreateUserCommand(user, userRepository);
            Command notifyCmd = new SendNotificationCommand(
                    notificationService, user.getEmail(), "Welcome!"
            );

            commandProcessor.addCommand(createCmd);
            commandProcessor.addCommand(notifyCmd);
        }

        commandProcessor.executeAll();
    }
}