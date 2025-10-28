package com.example.ChainOfResponsability.authService;

public class UserAuthenticationHandler extends AuthHandler {
    @Override
    public void handleRequest(AuthRequest request){
        System.out.println("Authenticating User");

        if(!request.isAuthenticated()){
            System.out.println("User is not authenticated");
            return;
        }

        if(request.getUserId() == null || request.getUserId().isEmpty()){
            request.setErrorMessage("User id is empty");
            request.setAuthenticated(false);
            return;
        }
        if (!isUserValid(request.getUserId())) {
            request.setErrorMessage("User not found");
            request.setAuthenticated(false);
            return;
        }

        System.out.println("User authenticated successfully");

        callNextHandler(request);
    }

    private boolean isUserValid(String userId) {
        return userId.startsWith("user_");
    }
}
