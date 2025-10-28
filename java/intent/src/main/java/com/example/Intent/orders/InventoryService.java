package com.example.Intent.orders;

public class InventoryService {
    public void reserveItems(String orderId) {
        System.out.println("Items reserved for order: " + orderId);
    }

    public void releaseItems(String orderId) {
        System.out.println("Items released for order: " + orderId);
    }
}