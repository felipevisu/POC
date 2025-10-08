package com.example.Mediator.notificationSystem;

class OrderService {
    private NotificationMediator mediator;

    public OrderService(NotificationMediator mediator) {
        this.mediator = mediator;
    }

    public void placeOrder(String orderId) {
        System.out.println("Placing order: " + orderId);
        mediator.notify(null, "ORDER_PLACED", orderId);
    }
}