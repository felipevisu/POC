package com.example.FactoryMethod;

public class EmailNotification implements Notification {
    @Override
    public void notifyUser(){
        System.out.println("Sending an Email Notification");
    }
}
