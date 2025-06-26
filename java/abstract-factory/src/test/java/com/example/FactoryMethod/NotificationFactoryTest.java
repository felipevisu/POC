package com.example.FactoryMethod;

import junit.framework.TestCase;

public class NotificationFactoryTest extends TestCase {
    public void testEmailNotificationFactoryCreatesEmailNotification() {
        NotificationFactory factory = new EmailNotificationFactory();
        Notification notification = factory.create();

        assertNotNull(notification);
        assertTrue(notification instanceof EmailNotification);
    }

    public void testSMSNotificationFactoryCreatesSMSNotification() {
        NotificationFactory factory = new SMSNotificationFactory();
        Notification notification = factory.create();

        assertNotNull(notification);
        assertTrue(notification instanceof SMSNotification);
    }
}