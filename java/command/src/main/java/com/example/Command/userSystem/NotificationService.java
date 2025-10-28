package com.example.Command.userSystem;

public class NotificationService {
    public void send(String recipient, String message) {
        System.out.println("📧 Sending to " + recipient + ": " + message);

        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
