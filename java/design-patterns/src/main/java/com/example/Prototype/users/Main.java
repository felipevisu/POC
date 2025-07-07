package com.example.Prototype.users;

public class Main {
    public static void main(String[] args) {
        UserRegistry registry = new UserRegistry();

        User adminTemplate = new User("Default Admin", "admin@domain.com", "ADMIN");
        User guestTemplate = new User("Guest User", "guest@domain.com", "GUEST");

        registry.register("admin", adminTemplate);
        registry.register("guest", guestTemplate);

        User clonedAdmin = registry.get("admin");
        clonedAdmin.setName("Alice");
        clonedAdmin.setEmail("alice@domain.com");

        User clonedGuest = registry.get("guest");
        clonedGuest.setName("Bob");
        clonedGuest.setEmail("bob@domain.com");

        System.out.println(clonedAdmin);
        System.out.println(clonedGuest);
    }
}
