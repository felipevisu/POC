package com.poc.producer;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;
import java.util.concurrent.ThreadLocalRandom;

public class ProducerApp {

    private static final Logger log = LoggerFactory.getLogger(ProducerApp.class);

    private static final int NUM_CUSTOMERS = 10;
    private static final String TOPIC = System.getenv().getOrDefault("TOPIC", "orders");

    public static void main(String[] args) throws Exception {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, "all");

        long orderId = 0;
        try (Producer<String, String> producer = new KafkaProducer<>(props)) {
            System.out.println("Producing to topic '" + TOPIC + "'. Ctrl-C to stop.");
            while (true) {
                int customer = ThreadLocalRandom.current().nextInt(NUM_CUSTOMERS);
                String key = "customer-" + customer;
                String value = "{\"orderId\":" + (++orderId)
                        + ",\"customerId\":\"" + key + "\""
                        + ",\"amount\":" + ThreadLocalRandom.current().nextInt(10, 500) + "}";

                ProducerRecord<String, String> record = new ProducerRecord<>(TOPIC, key, value);
                RecordMetadata md = producer.send(record).get();
                System.out.printf("sent  key=%-12s -> partition %d  offset %d%n",
                        key, md.partition(), md.offset());

                Thread.sleep(500);
            }
        }
    }
}
