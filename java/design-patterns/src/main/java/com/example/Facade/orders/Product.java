package com.example.Facade.orders;

public class Product {
    double price;
    String id;
    String name;

    public Product(String id, String name, double price) {
        this.price = price;
        this.id = id;
        this.name = name;
    }

    public double getPrice() {
        return price;
    }
    public String getId() {
        return id;
    }
    public String getName() {
        return name;
    }
}
