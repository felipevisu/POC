package com.example.FactoryMethod;

public class SMSNotificationFactory extends NotificationFactory {
    @Override
    public Notification create() {
        return new SMSNotification();
    }
}
