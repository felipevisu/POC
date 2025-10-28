package com.example.Decorator.coffee;

public class Main {
    public static void main(String[] args) {
        Coffee myCoffee = new SimpleCoffee();
        myCoffee = new MilkDecorator(myCoffee);
        myCoffee = new SugarDecorator(myCoffee);

        System.out.println(myCoffee.getDescription()); // Simple Coffee, Milk, Sugar
        System.out.println("Cost: $" + myCoffee.getCost()); // Cost: $7.0
    }
}