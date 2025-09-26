package com.example.Intent.orders;

public interface Intent {
    void execute();
    void undo();
    String getDescription();
}
