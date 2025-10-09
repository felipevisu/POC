package com.example.learningGson;

import com.google.gson.Gson;

import java.util.ArrayList;

class City{
    String name;

    public City(String name){
        this.name = name;
    }

    @Override
    public String toString() {
        return name;
    }
}

class State{
    String name;
    ArrayList<City> cities;

    public State(String name, ArrayList<City> cities){
        this.name = name;
        this.cities = cities;
    }

    @Override
    public String toString() {
        return name;
    }
}

class Country{
    String name;
    ArrayList<State> states;

    public Country(String name, ArrayList<State> states){
        this.name = name;
        this.states = states;
    }

    @Override
    public String toString() {
        return name;
    }
}

public class NestedObjectsExample {


    public static void main(String[] args){
        City ubatuba = new City("Ubatuba");
        City guaruja = new City("Guarujá");
        ArrayList<City> cities1 = new ArrayList<>();
        cities1.add(ubatuba);
        cities1.add(guaruja);
        State saoPaulo = new State("São Paulo", cities1);

        City beloHorizonte = new City("Belo Horizonte");
        City tiradentes = new City("Tiradentes");
        ArrayList<City> cities2 = new ArrayList<>();
        cities2.add(beloHorizonte);
        cities2.add(tiradentes);
        State minasGerais = new State("Minas Gerais", cities2);

        ArrayList<State> states = new ArrayList<>();
        states.add(saoPaulo);
        states.add(minasGerais);
        Country brazil = new Country("Brazil", states);

        // Serializing
        Gson gson = new Gson();
        String json = gson.toJson(brazil);
        System.out.println((json));

        // Deserializig
        Country parsedCountry = gson.fromJson(json, Country.class);
        System.out.println("Parsed Country: " + parsedCountry.name);
        for (State state : parsedCountry.states) {
            System.out.println("  State: " + state.name);
            for (City city : state.cities) {
                System.out.println("    City: " + city.name);
            }
        }
    }
}
