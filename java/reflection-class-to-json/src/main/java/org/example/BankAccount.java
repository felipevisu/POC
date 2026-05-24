package org.example;

class BankAccount {
    private String owner;
    private double balance;
    private boolean active;

    public BankAccount(String owner, double balance, boolean active) {
        this.owner = owner;
        this.balance = balance;
        this.active = active;
    }
}
