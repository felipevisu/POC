package com.example.Builder.cars.builder;

import com.example.Builder.cars.products.Car;
import com.example.Builder.cars.products.CarType;
import com.example.Builder.cars.components.Engine;
import com.example.Builder.cars.components.Transmission;

public class CarBuilder implements Builder {
    private CarType type;
    private int seats;
    private Engine engine;
    private Transmission transmission;

    public void setCarType(CarType type) {
        this.type = type;
    }

    @Override
    public void setSeats(int seats) {
        this.seats = seats;
    }

    @Override
    public void setEngine(Engine engine) {
        this.engine = engine;
    }

    @Override
    public void setTransmission(Transmission transmission) {
        this.transmission = transmission;
    }

    public Car getResult() {
        return new Car(type, seats, engine, transmission);
    }
}