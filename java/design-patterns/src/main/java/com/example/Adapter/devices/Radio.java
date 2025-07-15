package com.example.Adapter.devices;

public class Radio implements Device {
    private boolean on = false;
    private int volume = 30;
    private int channel = 1;

    @Override
    public boolean isEnabled(){
        return on;
    }

    @Override
    public int getVolume(){
        return volume;
    }

    @Override
    public int getChannel(){
        return channel;
    }

    @Override
    public void setVolume(int volume) {
        if (volume > 100) {
            this.volume = 100;
        } else this.volume = Math.max(volume, 0);
    }

    @Override
    public void setChannel(int value){
        channel = value;
    }

    @Override
    public void enable(){
        on = true;
    }

    @Override
    public void disable(){
        on = false;
    }

    @Override
    public void printStatus() {
        System.out.println("------------------------------------");
        System.out.println("| I'm radio.");
        System.out.println("| I'm " + (on ? "enabled" : "disabled"));
        System.out.println("| Current volume is " + volume + "%");
        System.out.println("| Current channel is " + channel);
        System.out.println("------------------------------------\n");
    }
}
