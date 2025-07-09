package com.example.adapter.logger;

public class LoggerAdapter implements Logger {
    private final NewLogger newLogger;

    public LoggerAdapter(NewLogger newLogger) {
        this.newLogger = newLogger;
    }

    @Override
    public void log(String message) {
        newLogger.logInfo(message, "LegacySystem");
    }
}
