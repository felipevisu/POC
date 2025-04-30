package com.example.learningGson;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

class Person {
    @SerializedName("full_name")
    String name;
}

public class FieldNamesExample {
    public static void main(String[] args){
        Person person = new Person();
        person.name = "Felipe Faria";

        Gson gson = new Gson();

        // Serializing
        String json = gson.toJson(person);
        System.out.println("Serialized json: " + json);

        // Deserializing
        Person parsed = gson.fromJson(json, Person.class);
        System.out.println("Deserialized name: " + parsed.name);
    }
}
