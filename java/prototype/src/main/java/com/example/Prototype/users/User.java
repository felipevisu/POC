package com.example.Prototype.users;

public class User implements Prototype<User> {
    private String name;
    private String email;
    private String role;

    public User(String name, String email, String role){
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public User(User user){
        this.name = user.name;
        this.email = user.email;
        this.role = user.role;
    }

    @Override
    public User clone() {
        return new User(this);
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', email='" + email + "', role='" + role + "'}";
    }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
}
