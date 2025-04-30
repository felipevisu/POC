package com.example.learningGson;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class PrettyPrintExample {
    public static void main(String[] args){
        User user = new User();
        user.name = "Felipe";
        user.age = 30;

        Gson gson = new GsonBuilder()
                .setPrettyPrinting()
                .create();

        String prettyJsonUser = gson.toJson(user);
        System.out.println(prettyJsonUser);
    }
}
