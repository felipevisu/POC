package com.example.Mediator.notificationSystem;

public class PaymentService {
    private NotificationMediator mediator;

    public PaymentService(NotificationMediator mediator) {
        this.mediator = mediator;
    }

    public void processPayment(String userId, boolean success) {
        if (!success) {
            System.out.println("Payment failed for user: " + userId);
            mediator.notify(null, "PAYMENT_FAILED", userId);
        }
    }
}
