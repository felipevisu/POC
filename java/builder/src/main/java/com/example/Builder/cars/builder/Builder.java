package com.example.Builder.cars.builder;

import com.example.Builder.cars.products.CarType;
import com.example.Builder.cars.components.Engine;
import com.example.Builder.cars.components.Transmission;

public interface Builder {
    void setCarType(CarType type);
    void setSeats(int seats);
    void setEngine(Engine engine);
    void setTransmission(Transmission transmission);
}
