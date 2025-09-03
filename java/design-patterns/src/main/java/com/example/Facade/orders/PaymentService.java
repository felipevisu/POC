package com.example.Facade.orders;

public class PaymentService {
    public boolean processPayment(String customerId, double amount) {
        System.out.println("Processing payment for " + customerId + " with amount " + amount);
        return true;
    }
}
