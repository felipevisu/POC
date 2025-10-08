package com.example.Mediator.notificationSystem;

public class Demo {
    public static void main(String[] args) {
        NotificationSystem mediator = new NotificationSystem();

        EmailService emailService = new EmailService(mediator);
        SMSService smsService = new SMSService(mediator);

        mediator.registerComponent(emailService);
        mediator.registerComponent(smsService);

        OrderService orderService = new OrderService(mediator);
        PaymentService paymentService = new PaymentService(mediator);

        orderService.placeOrder("order123");
        paymentService.processPayment("user456", false);
    }
}
