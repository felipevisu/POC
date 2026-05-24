package org.example;

import static org.example.JsonReflection.toJson;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    static void main() throws Exception {
        BankAccount account = new BankAccount("Felipe", 1000.0, true);
        Product laptop = new Product("Laptop", 3, 4999.90);

        // Same method, two different class types — no special casing.
        System.out.println("BankAccount -> " + toJson(account));
        System.out.println("Product     -> " + toJson(laptop));
    }
}
