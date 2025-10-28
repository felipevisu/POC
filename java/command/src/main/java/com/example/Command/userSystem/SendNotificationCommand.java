package com.example.Command.userSystem;

public class SendNotificationCommand implements Command {
    private final NotificationService notificationService;
    private final String recipient;
    private final String message;

    public SendNotificationCommand(NotificationService notificationService,
                                   String recipient, String message) {
        this.notificationService = notificationService;
        this.recipient = recipient;
        this.message = message;
    }

    @Override
    public void execute() {
        notificationService.send(recipient, message);
        System.out.println("Notification sent to: " + recipient);
    }

    @Override
    public void undo() {
        // Notifications can't be unsent, but we can log the attempt
        System.out.println("Cannot undo notification to: " + recipient);
    }
}
