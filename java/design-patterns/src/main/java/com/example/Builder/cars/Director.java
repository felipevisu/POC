package com.example.Builder.cars;

import com.example.Builder.cars.builder.Builder;
import com.example.Builder.cars.components.Engine;
import com.example.Builder.cars.components.Transmission;
import com.example.Builder.cars.products.CarType;

public final class Director {
    private Director() {}

    public static void constructSUV(Builder builder){
        builder.setCarType(CarType.SUV);
        builder.setSeats(4);
        builder.setEngine(new Engine(2.5, 0));
        builder.setTransmission(Transmission.MANUAL);
    }

    public static void constructSport(Builder builder){
        builder.setCarType(CarType.SPORT);
        builder.setSeats(2);
        builder.setEngine(new Engine(1.2, 0));
        builder.setTransmission(Transmission.AUTOMATIC);
    }
}
