package com.example.Mediator.notificationSystem;

public class EmailService extends Component{
    public EmailService(NotificationMediator mediator) {
        super(mediator);
    }

    public void sendOrderConfirmation(String orderId) {
        System.out.println("[EMAIL] Sending order confirmation for: " + orderId);
    }

    public void sendPaymentFailedNotification(String userId) {
        System.out.println("[EMAIL] Sending payment failed notification to: " + userId);
    }
}
