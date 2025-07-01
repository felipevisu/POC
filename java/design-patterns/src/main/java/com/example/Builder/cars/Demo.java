package com.example.Builder.cars;

import com.example.Builder.cars.builder.CarBuilder;
import com.example.Builder.cars.builder.ManualBuilder;
import com.example.Builder.cars.products.Car;
import com.example.Builder.cars.products.Manual;

public class Demo {
    public static void main(String[] args) {
        CarBuilder carBuilder = new CarBuilder();
        ManualBuilder manualBuilder = new ManualBuilder();

        Director.constructSport(carBuilder);
        Car car = carBuilder.getResult();
        System.out.println("Car built:\n" + car.getCarType());

        Director.constructSport(manualBuilder);
        Manual carManual = manualBuilder.getResult();
        System.out.println("\nCar manual built:\n" + carManual.print());
    }
}
