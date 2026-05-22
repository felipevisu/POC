package org.example;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    static void main() throws Exception  {
        BankAccount account = new BankAccount("Felipe", 1000);
        System.out.println("Start:" + account);

        Class<?> clazz = account.getClass();

        // Read
        System.out.println("Read all fields of the class");
        Field[] fields = clazz.getDeclaredFields();
        for (Field f : fields) {
            System.out.println(f.getName() + " : " + f.getType());
        }

        // Invoke
        System.out.println("Call method");
        Method applyInterest = clazz.getDeclaredMethod("applyInterest", double.class);
        applyInterest.setAccessible(true);
        applyInterest.invoke(account, 0.05);

        Method getBalance = clazz.getDeclaredMethod("getBalance");
        double bal = (double) getBalance.invoke(account);
        System.out.println("  getBalance() returned: " + bal);

        // Modify
        System.out.println("Overwrite private method");
        Field balanceField = clazz.getDeclaredField("balance");
        balanceField.setAccessible(true);
        balanceField.setDouble(account, 9999.99);

        Field ownerField = clazz.getDeclaredField("owner");
        ownerField.setAccessible(true);
        ownerField.set(account, "Bob");

        System.out.println("  After modify: " + account);
    }
}
