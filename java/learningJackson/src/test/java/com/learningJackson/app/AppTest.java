package com.learningJackson.app;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.IOException;

/**
 * Unit test for simple App.
 */
public class AppTest {
    @Test
    public void whenSerializingUsingJsonAnyGetter_thenCorrect() throws JsonProcessingException {
        ExtendableBean bean = new ExtendableBean("My Bean");
        bean.add("attr1", "val1");
        bean.add("attr2", "val2");

        String result = new ObjectMapper().writeValueAsString(bean);

        assertTrue(result.contains("attr1"));
        assertTrue(result.contains("val1"));

        System.out.println(result);
    }

    @Test
    public void whenSerializingUsingJsonGetter_thenCorrect() throws IOException {
        MyBean bean = new MyBean(1, "My Bean");
        String serialized = new ObjectMapper().writeValueAsString(bean);

        assertTrue(serialized.contains("My Bean"));
        assertTrue(serialized.contains("1"));

        System.out.println(serialized);

        MyBean parsedBean = new ObjectMapper().readValue(serialized, MyBean.class);

        assertEquals(1, parsedBean.id);
        assertEquals("My Bean", parsedBean.getName());
    }

    @Test
    public void whenSerializingUsingJsonPropertyOrder_thenCorrect()
            throws JsonProcessingException {
        Person person = new Person("Felipe", "Faria", 0, 30);
        String result = new ObjectMapper().writeValueAsString(person);
        assertEquals("{\"firstName\":\"Felipe\",\"lastName\":\"Faria\",\"age\":30,\"children\":0}", result);
    }

    @Test
    public void whenSerializingUsingJsonRawValue_thenCorrect()
            throws JsonProcessingException {
        RawBean bean = new RawBean();
        bean.name = "Felipe Faria";
        bean.json = "{'age': 30}";
        String result = new ObjectMapper().writeValueAsString(bean);
        assertTrue(result.contains("{'age': 30}"));
    }
}
