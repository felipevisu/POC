package com.example.Intent.orders;

public class PaymentService {
    public void processPayment(String customerId, double amount) {
        System.out.println("Payment processed for customer: " + customerId + ", amount: $" + amount);
    }

    public void refundPayment(String customerId, double amount) {
        System.out.println("Payment refunded for customer: " + customerId + ", amount: $" + amount);
    }
}
