package com.example.basicstreams;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Random;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

public class SimpleProducer {
    private static final Random random = new Random();
    private static int eventCounter = 0;

    public static void main(String[] args) throws InterruptedException {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);

        try (Producer<String, String> producer = new KafkaProducer<>(props)) {
            System.out.println("Starting Simple Event Producer...\n");

            while (true) {
                String eventId = "event-" + eventCounter++;
                String eventData = "USER_LOGIN";

                ProducerRecord<String, String> record =
                        new ProducerRecord<>("raw-events", eventId, eventData);

                producer.send(record);
                System.out.println("Sent: " + eventId + " -> " + eventData);

                TimeUnit.SECONDS.sleep(1);
            }
        }
    }
}