package com.example.learningGson;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.List;


public class ListExample {
    private static User createUser(String name, int age) {
        User u = new User();
        u.name = name;
        u.age = age;
        return u;
    }

    public static void main(String[] args){
        Gson gson = new Gson();
        List<String> colors = Arrays.asList("red", "blue", "orange");

        // Serialize to JSON
        String json = gson.toJson(colors);
        System.out.println("Serialized JSON: " + json);

        // Deserialize from JSON
        Type listType = new TypeToken<List<String>>(){}.getType();
        List<String> parsedColors = gson.fromJson(json, listType);

        System.out.println("Deserialized List: " + parsedColors);


        List<User> users = Arrays.asList(
                createUser("Felipe", 30),
                createUser("Ana", 25)
        );

        // Serialize to JSON
        String usersJson = gson.toJson(users);
        System.out.println("Serialized JSON:\n" + usersJson);

        // Deserialize from JSON
        Type userListType = new TypeToken<List<User>>(){}.getType();
        List<User> parsedUsers = gson.fromJson(usersJson, userListType);

        System.out.println("Deserialized Users:");
        parsedUsers.forEach(System.out::println);
    }
}
