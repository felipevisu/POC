package com.learningJackson.app;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.InjectableValues;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

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

    @Test
    public void whenSerializingUsingJsonRootName_thenCorrect()
            throws JsonProcessingException {
        Person person = new Person("Felipe", "Faria", 0, 30);
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.WRAP_ROOT_VALUE);
        String result = mapper.writeValueAsString(person);
        assertTrue(result.contains("Person"));
    }

    @Test
    public void whenSerializingUsingJsonSerialize_thenCorrect()
            throws JsonProcessingException, ParseException {
        SimpleDateFormat df = new SimpleDateFormat("dd-MM-yyyy hh:mm:ss");
        String toParse = "20-12-2014 02:30:00";
        Date date = df.parse(toParse);
        Event event = new Event("Party", date);
        String result = new ObjectMapper().writeValueAsString(event);
        assertTrue(result.contains(toParse));
    }

    @Test
    public void whenDeserializingUsingJsonCreator_thenCorrect()
            throws IOException {
        String json = "{\"id\":10,\"theName\":\"Felipe Faria\"}";
        BeanWithCreator bean = new ObjectMapper()
                .readerFor(BeanWithCreator.class)
                .readValue(json);
        assertEquals("Felipe Faria", bean.name);
    }

    @Test
    public void whenDeserializingUsingJsonInject_thenCorrect()
            throws IOException {
        String json = "{\"name\":\"Felipe Faria\"}";
        InjectableValues inject = new InjectableValues.Std()
                .addValue(int.class, 1);
        BeanWithInject bean = new ObjectMapper()
                .reader(inject)
                .forType(BeanWithInject.class)
                .readValue(json);
        assertEquals("Felipe Faria", bean.name);
        assertEquals(1, bean.id);
    }
}
