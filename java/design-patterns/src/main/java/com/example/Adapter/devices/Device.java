package com.example.Adapter.devices;

public interface Device {
    boolean isEnabled();
    void enable();
    void disable();
    int getVolume();
    void setVolume(int value);
    int getChannel();
    void setChannel(int value);
    void printStatus();
}
