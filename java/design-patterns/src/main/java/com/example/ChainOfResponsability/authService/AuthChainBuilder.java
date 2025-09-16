package com.example.ChainOfResponsability.authService;

public class AuthChainBuilder {
    public static AuthHandler buildAuthChain() {
        AuthHandler tokenHandler = new TokenValidationHandler();
        AuthHandler userHandler = new UserAuthenticationHandler();
        AuthHandler roleHandler = new RoleAuthorizationHandler();
        AuthHandler rateLimitHandler = new RateLimitHandler();

        tokenHandler.setNextHandler(userHandler);
        userHandler.setNextHandler(roleHandler);
        roleHandler.setNextHandler(rateLimitHandler);

        return tokenHandler;
    }
}
