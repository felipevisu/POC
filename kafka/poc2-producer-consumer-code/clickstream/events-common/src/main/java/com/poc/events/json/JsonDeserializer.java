package com.poc.events.json;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Deserializer;

/** Turns JSON bytes back into an object of the given type. */
public class JsonDeserializer<T> implements Deserializer<T> {

    private final ObjectMapper mapper = new ObjectMapper();
    private final Class<T> targetType;

    public JsonDeserializer(Class<T> targetType) {
        this.targetType = targetType;
    }

    @Override
    public T deserialize(String topic, byte[] data) {
        if (data == null) {
            return null;
        }
        try {
            return mapper.readValue(data, targetType);
        } catch (Exception e) {
            throw new SerializationException("Failed to deserialize value from topic " + topic, e);
        }
    }
}
