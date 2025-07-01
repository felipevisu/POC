package com.example.Builder.cars.products;

import com.example.Builder.cars.components.Engine;
import com.example.Builder.cars.components.Transmission;

public class Car {
    private final CarType carType;
    private final int seats;
    private final Engine engine;
    private final Transmission transmission;
    private double fuel = 0;

    public Car(CarType carType, int seats, Engine engine, Transmission transmission){
        this.carType = carType;
        this.seats = seats;
        this.engine = engine;
        this.transmission = transmission;
    }

    public CarType getCarType(){
        return carType;
    }

    public int getSeats(){
        return seats;
    }

    public double getFuel(){
        return fuel;
    }

    public void setFuel(double fuel){
        this.fuel = fuel;
    }

    public Engine getEngine() {
        return engine;
    }

    public Transmission getTransmission() {
        return transmission;
    }
}
