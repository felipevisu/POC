package com.example.ChainOfResponsability.authService;

public class RoleAuthorizationHandler extends AuthHandler {

    @Override
    public void handleRequest(AuthRequest request) {
        System.out.println("Checking role-based authorization...");

        if (!request.isAuthenticated()) {
            System.out.println("Skipping authorization - authentication failed");
            return;
        }

        if (!hasPermission(request.getUserId(), request.getResource(), request.getAction())) {
            request.setErrorMessage("Insufficient permissions for this action");
            return;
        }

        System.out.println("User authorized for this action");
        request.setAuthorized(true);
        callNextHandler(request);
    }

    private boolean hasPermission(String userId, String resource, String action) {
        if (userId.contains("admin")) {
            return true;
        }

        if (resource.equals("users") && action.equals("read")) {
            return true;
        }

        return resource.equals("users") && action.equals("write") && userId.contains("manager");
    }
}
