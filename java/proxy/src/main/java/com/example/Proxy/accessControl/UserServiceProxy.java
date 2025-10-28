package com.example.Proxy.accessControl;

public class UserServiceProxy implements UserService {
    private final UserServiceImpl realService;
    private final String currentUserRole;

    public UserServiceProxy(UserServiceImpl realService, String currentUserRole) {
        this.realService = realService;
        this.currentUserRole = currentUserRole;
    }

    @Override
    public String getUserData(String userId) {
        if ("ADMIN".equals(currentUserRole)) {
            System.out.println("Access granted to ADMIN.");
            return realService.getUserData(userId);
        } else {
            System.out.println("Access denied for non-admin role.");
            return "Access Denied";
        }
    }
}
