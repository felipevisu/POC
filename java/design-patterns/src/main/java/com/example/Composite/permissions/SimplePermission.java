package com.example.Composite.permissions;

public class SimplePermission implements Permission {
    private String name;

    public SimplePermission(String name){
        this.name = name;
    }

    @Override
    public void show(){
        System.out.println("Permission: " + name);
    }
}
