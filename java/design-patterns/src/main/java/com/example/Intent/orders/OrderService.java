package com.example.Intent.orders;

public class OrderService {
    public void createOrder(Order order) {
        System.out.println("Order created: " + order.getId());
    }

    public void cancelOrder(String orderId) {
        System.out.println("Order cancelled: " + orderId);
    }
}
