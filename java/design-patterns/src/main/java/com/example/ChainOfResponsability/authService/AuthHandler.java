package com.example.ChainOfResponsability.authService;

public abstract class AuthHandler {
    protected AuthHandler nextHandler;

    public void setNextHandler(AuthHandler nextHandler) {
        this.nextHandler = nextHandler;
    }

    public abstract void handleRequest(AuthRequest request);

    protected void callNextHandler(AuthRequest request) {
        if(nextHandler != null) {
            nextHandler.handleRequest(request);
        } else {
            System.out.println("No more handlers to call");
        }
    }
}
