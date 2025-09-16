package com.example.ChainOfResponsability.authService;

public class RateLimitHandler extends AuthHandler {
    private static final int MAX_REQUESTS_PER_MINUTE = 100;

    @Override
    public void handleRequest(AuthRequest request) {
        System.out.println("Checking rate limits...");

        if (!request.isAuthenticated() || !request.isAuthorized()) {
            System.out.println("Skipping rate limit - previous checks failed");
            return;
        }

        if (isRateLimitExceeded(request.getUserId())) {
            request.setErrorMessage("Rate limit exceeded. Please try again later.");
            request.setAuthorized(false);
            return;
        }

        System.out.println("Rate limit check passed");

        callNextHandler(request);
    }

    private boolean isRateLimitExceeded(String userId) {
        return userId.equals("user_spammer");
    }
}
