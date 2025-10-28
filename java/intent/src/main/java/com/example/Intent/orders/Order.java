package com.example.Intent.orders;

public class Order {
    private String id;
    private String customerId;
    private double amount;
    private Status status;

    public Order(String id, String customerId, double amount) {
        this.id = id;
        this.customerId = customerId;
        this.amount = amount;
        this.status = Status.PENDING;
    }

    // Getters
    public String getId() {
        return id;
    }
    public String getCustomerId() {
        return customerId;
    }
    public double getAmount() {
        return amount;
    }
    public Status getStatus() {
        return status;
    }

    // Setters
    public void setStatus(Status status) {
        this.status = status;
    }
}
