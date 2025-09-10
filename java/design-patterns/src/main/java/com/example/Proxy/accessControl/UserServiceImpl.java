package com.example.Proxy.accessControl;

public class UserServiceImpl implements UserService  {

    @Override
    public String getUserData(String userId) {
        // Simulate DB call
        return "Sensitive data of user " + userId;
    }
}