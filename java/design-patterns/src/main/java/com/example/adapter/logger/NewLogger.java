package com.example.adapter.logger;

public class NewLogger {
    public void logInfo(String message, String context) {
        System.out.println("[INFO][" + context + "] " + message);
    }
}