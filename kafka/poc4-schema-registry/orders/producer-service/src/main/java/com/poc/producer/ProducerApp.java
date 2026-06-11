package com.poc.producer;

import com.poc.orders.Order;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;
import java.util.concurrent.ThreadLocalRandom;

public class ProducerApp {
    private static final int NUM_CUSTOMERS = 10;
    private static final String TOPIC = System.getenv().getOrDefault("TOPIC", "orders");

    public static void main(String[] args) throws Exception {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, KafkaAvroSerializer.class.getName()); // ← was StringSerializer
        props.put("schema.registry.url", "http://localhost:8081");     
        props.put(ProducerConfig.ACKS_CONFIG, "all");

        long orderId = 0;
        try (Producer<String, Order> producer = new KafkaProducer<>(props)) {   // <String, Order>
            System.out.println("Producing to topic '" + TOPIC + "'. Ctrl-C to stop.");
            while (true) {
                int customer = ThreadLocalRandom.current().nextInt(NUM_CUSTOMERS);
                String key = "customer-" + customer;

                Order value = Order.newBuilder()
                        .setOrderId(++orderId)
                        .setCustomerId(key)
                        .setAmount(ThreadLocalRandom.current().nextInt(10, 500))
                        .build();

                ProducerRecord<String, Order> record = new ProducerRecord<>(TOPIC, key, value);  // <String, Order>
                RecordMetadata md = producer.send(record).get();
                System.out.printf("sent  key=%-12s -> partition %d  offset %d%n",
                        key, md.partition(), md.offset());

                Thread.sleep(500);
            }
        }
    }
}
