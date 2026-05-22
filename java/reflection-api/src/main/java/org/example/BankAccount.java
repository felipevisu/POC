package org.example;

public class BankAccount {
    private String owner;
    private double balance;
    private final String accountId;

    public BankAccount(String owner, double balance){
        this.owner = owner;
        this.balance = balance;
        this.accountId = "ACC-" + (int) (Math.random() * 10000);
    }

    private void applyInterest(double rate) {
        balance += balance * rate;
        System.out.printf("  Applied %.1f%% interest. New balance: %.2f%n", rate * 100, balance);
    }

    public double getBalance() {
        return balance;
    }

    @Override
    public String toString() {
        return owner + " [" + accountId + "] balance=" + balance;
    }
}
