package com.example.Composite.permissions;

import java.util.ArrayList;
import java.util.List;

public class Role implements Permission {
    private final String name;
    private final List<Permission> permissions = new ArrayList<>();

    public Role(String name){
        this.name = name;
    }

    public void addPermission(Permission permission){
        permissions.add(permission);
    }

    public void removePermission(Permission permission){
        permissions.remove(permission);
    }

    @Override
    public void show(){
        System.out.println("Role: " + name);
        for (Permission permission : permissions) {
            permission.show();
        }
    }
}
