package com.learningJackson.app;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashMap;
import java.util.Map;

public class ExtendableBean {
    public String name;
    private final Map<String, String> properties = new HashMap<>();

    public ExtendableBean(@JsonProperty("name") String name) {
        this.name = name;
    }

    @JsonAnySetter
    public void add(String key, String value) {
        this.properties.put(key, value);
    }

    @JsonAnyGetter
    public Map<String, String> getProperties() {
        return this.properties;
    }
}
