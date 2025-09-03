package com.example.Facade.orders;

public class InventoryService {
    public boolean checkStock(String item, int quantity) {
        System.out.println("Checking availability of " + item);
        return true;
    }
}
