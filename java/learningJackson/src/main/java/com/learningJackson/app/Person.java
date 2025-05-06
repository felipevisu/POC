package com.learningJackson.app;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({ "firstName", "lastName", "age", "children" })
public class Person {
    public String firstName;
    public String lastName;
    public int children;
    public int age;
}
