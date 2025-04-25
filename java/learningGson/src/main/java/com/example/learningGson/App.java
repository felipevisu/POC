package com.example.learningGson;


import com.google.gson.Gson;

/**
 * Hello world!
 *
 */
public class App 
{
    static class User{
        String name;
        int age;
    }
    public static void main( String[] args )
    {
        User user = new User();
        user.name = "Felipe";
        user.age = 30;

        Gson gson = new Gson();

        String json = gson.toJson(user);
        System.out.println("Serialized: " + json);
    }
}
