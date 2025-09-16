package com.example.ChainOfResponsability.authService;

public class TokenValidationHandler extends AuthHandler {
    @Override
    public void handleRequest(AuthRequest request){
        System.out.println("Validating Token");

        if(request.getToken() == null || request.getToken().isEmpty()){
            request.setErrorMessage("Token is empty");
            return;
        }

        if (!isValidToken(request.getToken())) {
            request.setErrorMessage("Invalid token");
            return;
        }

        System.out.println("Token is valid");
        request.setAuthenticated(true);

        callNextHandler(request);
    }

    private boolean isValidToken(String token) {
        return token.startsWith("valid_") && token.length() > 10;
    }
}
