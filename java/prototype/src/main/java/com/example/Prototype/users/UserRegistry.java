package com.example.Prototype.users;

import java.util.HashMap;
import java.util.Map;

public class UserRegistry {
    private final Map<String, User> prototypes = new HashMap<>();

    public void register(String key, User prototype) {
        prototypes.put(key, prototype);
    }

    public User get(String key) {
        User prototype = prototypes.get(key);
        return prototype != null ? prototype.clone() : null;
    }
}
