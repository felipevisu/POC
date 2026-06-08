package com.poc.consumer;


import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.Duration;
import java.util.*;

public class ConsumerApp {

    private static final String TOPIC = System.getenv().getOrDefault("TOPIC", "orders");
    private static final String NAME  = System.getenv().getOrDefault(
            "CONSUMER_NAME", "C-" + UUID.randomUUID().toString().substring(0, 4));

    public static void main(String[] args) {
        String groupId   = System.getenv().getOrDefault("GROUP_ID", "order-processors");
        String strategy  = assignor(System.getenv().getOrDefault("ASSIGNMENT", "range"));

        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, strategy);
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, String.valueOf(true));

        System.out.printf(
            "[%s] starting | group=%s | commit=%s | assignor=%s%n",
            NAME, groupId, "AUTO", strategy.substring(strategy.lastIndexOf('.') + 1)
        );

        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

        ConsumerRebalanceListener listener = new ConsumerRebalanceListener() {
            @Override public void onPartitionsRevoked(Collection<TopicPartition> parts) {
                System.out.printf("[%s] REVOKED  %s%n", NAME, partitionsOf(parts));
            }
            @Override public void onPartitionsAssigned(Collection<TopicPartition> parts) {
                System.out.printf("[%s] ASSIGNED %s%n", NAME, partitionsOf(parts));
            }
        };
        consumer.subscribe(Collections.singletonList(TOPIC), listener);
        try {
            while (true) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));
                for (ConsumerRecord<String, String> r : records) {
                    System.out.printf(
                        "[%s] PROCESSED p%d off=%d key=%s%n",
                        NAME, r.partition(), r.offset(), r.key()
                    );
                }
            }
        } finally {
            consumer.close();
        }
    }

    private static String partitionsOf(Collection<TopicPartition> parts) {
        if (parts.isEmpty()) return "[ none - IDLE ]";
        return parts.stream().map(p -> "p" + p.partition()).sorted().toList().toString();
    }

    private static String assignor(String shortName) {
        return switch (shortName.toLowerCase()) {
            case "roundrobin" -> "org.apache.kafka.clients.consumer.RoundRobinAssignor";
            case "sticky" -> "org.apache.kafka.clients.consumer.StickyAssignor";
            case "cooperative" -> "org.apache.kafka.clients.consumer.CooperativeStickyAssignor";
            default -> "org.apache.kafka.clients.consumer.RangeAssignor";
        };
    }
}
