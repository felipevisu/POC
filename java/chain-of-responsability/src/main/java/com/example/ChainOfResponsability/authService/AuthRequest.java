package com.example.ChainOfResponsability.authService;

public class AuthRequest {
    private String token;
    private String userId;
    private String resource;
    private String action;
    private String errorMessage;
    private boolean isAuthorized = false;
    private boolean isAuthenticated = false;

    public AuthRequest(String token, String userId, String resource, String action) {
        this.token = token;
        this.userId = userId;
        this.resource = resource;
        this.action = action;
    }

    // Getters
    public String getToken() {
        return token;
    }
    public String getUserId() {
        return userId;
    }
    public String getResource() {
        return resource;
    }
    public String getAction() {
        return action;
    }
    public String getErrorMessage() {
        return errorMessage;
    }
    public boolean isAuthorized() {
        return isAuthorized;
    }
    public boolean isAuthenticated() {
        return isAuthenticated;
    }

    // Setters
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    public void setAuthorized(boolean isAuthorized) {
        this.isAuthorized = isAuthorized;
    }
    public void setAuthenticated(boolean isAuthenticated) {
        this.isAuthenticated = isAuthenticated;
    }
}
