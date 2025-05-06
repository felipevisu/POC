package com.learningJackson.app;

import com.fasterxml.jackson.annotation.JsonAnyGetter;

import java.util.HashMap;
import java.util.Map;

public class ExtendableBean {
    public String name;
    private final Map<String, String> properties = new HashMap<>();

    public ExtendableBean(String name) {
        this.name = name;
    }

    public void add(String key, String value) {
        this.properties.put(key, value);
    }

    @JsonAnyGetter
    public Map<String, String> getProperties() {
        return this.properties;
    }
}
