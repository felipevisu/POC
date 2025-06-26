package com.example.FactoryMethod;

public class EmailNotificationFactory extends NotificationFactory {
    @Override
    public Notification create() {
        return new EmailNotification();
    }
}
