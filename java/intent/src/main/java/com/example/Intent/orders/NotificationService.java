package com.example.Intent.orders;

public class NotificationService {
    public void sendOrderConfirmation(String customerId, String orderId) {
        System.out.println("Order confirmation sent to customer: " + customerId + " for order: " + orderId);
    }

    public void sendCancellationNotification(String customerId, String orderId) {
        System.out.println("Cancellation notification sent to customer: " + customerId + " for order: " + orderId);
    }
}
