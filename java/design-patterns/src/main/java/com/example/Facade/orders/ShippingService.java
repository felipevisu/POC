package com.example.Facade.orders;

public class ShippingService {
    public void shipProduct(String productId, String customerId) {
        System.out.println("Shipping product " + productId + " to customer " + customerId);
    }
}
