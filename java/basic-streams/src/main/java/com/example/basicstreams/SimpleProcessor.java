package com.example.basicstreams;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.Branched;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Named;
import org.apache.kafka.streams.kstream.Produced;

import java.util.Map;
import java.util.Properties;

public class SimpleProcessor {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "event-processor-app");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());

        StreamsBuilder builder = new StreamsBuilder();

        KStream<String, String> rawEvents = builder.stream("raw-events");

        KStream<String, String> processedEvents = rawEvents
                .mapValues(value -> enrichEvent(value))
                .filter((key, value) -> value != null);

        Map<String, KStream<String, String>> branches = processedEvents
                .split(Named.as("event-"))
                .branch((key, value) -> value.contains("\"priority\":\"HIGH\""),
                        Branched.withConsumer(ks -> ks.to("high-priority-events")))
                .branch((key, value) -> value.contains("ERROR"),
                        Branched.withConsumer(ks -> ks.to("error-events")))
                .branch((key, value) -> value.contains("PURCHASE"),
                        Branched.withConsumer(ks -> ks.to("purchase-events")))
                .defaultBranch(Branched.withConsumer(ks -> ks.to("processed-events")));

        rawEvents
                .groupByKey()
                .count(Named.as("events-per-user"))
                .toStream()
                .mapValues((user, count) -> "{\"user\":\"%s\",\"event_count\":%d}".formatted(user, count))
                .to("user-statistics", Produced.with(Serdes.String(), Serdes.String()));

        KafkaStreams streams = new KafkaStreams(builder.build(), props);

        System.out.println("Stream Topology:\n" + builder.build().describe());

        streams.start();
        System.out.println("Stream Processor started. Processing events...");

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down Stream Processor...");
            streams.close();
        }));
    }

    private static String enrichEvent(String event) {
        try {
            String processed = event.substring(0, event.length() - 1); // Remove closing }

            String priority = "NORMAL";
            if (event.contains("ERROR")) {
                priority = "HIGH";
            } else if (event.contains("PURCHASE") && event.contains("amount")) {
                if (event.matches(".*\"amount\":[0-9]{3,}\\.[0-9]+.*")) {
                    priority = "HIGH";
                }
            }

            return processed + ",\"processed_at\":%d,\"priority\":\"%s\",\"version\":\"1.0\"}".formatted(
                    System.currentTimeMillis(), priority);

        } catch (Exception e) {
            System.err.println("Error processing event: " + e.getMessage());
            return null;
        }
    }
}
