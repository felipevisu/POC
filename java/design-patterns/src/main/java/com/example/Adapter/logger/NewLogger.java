package com.example.Adapter.logger;

public class NewLogger {
    public void logInfo(String message, String context) {
        System.out.println("[INFO][" + context + "] " + message);
    }
}