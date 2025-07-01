package com.example.AbstractFactory;

public class WindowsButton implements Button {
    @Override
    public String render() {
        return "Windows Button";
    }
}
