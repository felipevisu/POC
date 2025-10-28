package com.example.ChainOfResponsability.authService;

public class AuthService {
    private AuthHandler authHandler = null;

    public AuthService() {
        this.authHandler = AuthChainBuilder.buildAuthChain();
    }

    public AuthResult authenticate(String token, String userId, String resource, String action) {
        AuthRequest request = new AuthRequest(token, userId, resource, action);

        System.out.println("Starting authentication process");
        System.out.println("Request: " + userId + " wants to " + action + " on " + resource);

        authHandler.handleRequest(request);

        if (request.getErrorMessage() != null) {
            System.out.println("Authentication failed: " + request.getErrorMessage());
            return new AuthResult(false, request.getErrorMessage());
        } else if (request.isAuthenticated() && request.isAuthorized()) {
            System.out.println("Authentication successful!");
            return new AuthResult(true, "Access granted");
        } else {
            System.out.println("Authentication incomplete");
            return new AuthResult(false, "Authentication process incomplete");
        }
    }
}
