package org.example;

import java.lang.reflect.Field;

public class JsonReflection {
    static String toJson(Object obj) throws IllegalAccessException {
        Class<?> clazz = obj.getClass();
        Field[] fields = clazz.getDeclaredFields();

        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < fields.length; i++) {
            Field f = fields[i];
            f.setAccessible(true);
            Object value = f.get(obj);

            sb.append('"').append(f.getName()).append("\":");

            if (value == null) {
                sb.append("null");
            } else if (value instanceof String) {
                sb.append('"').append(value).append('"');
            } else {
                sb.append(value);
            }

            if (i < fields.length - 1) sb.append(',');
        }
        return sb.append('}').toString();
    }
}
