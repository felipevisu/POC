package com.electromart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Stream;

public class CsvConnector {

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String[] HEADERS = {
        "sale_id", "product_code", "product_name", "category", "brand",
        "salesman_name", "salesman_email", "region", "store_name", "city",
        "store_type", "quantity", "unit_price", "total_amount", "status", "sale_date"
    };

    private static final Set<String> NUMERIC_FIELDS = Set.of("quantity", "unit_price", "total_amount");

    public static void main(String[] args) throws Exception {
        String broker = System.getenv().getOrDefault("KAFKA_BROKER", "kafka:9092");
        String topic = System.getenv().getOrDefault("KAFKA_TOPIC", "csv");
        String inboxDir = System.getenv().getOrDefault("INBOX_DIR", "/data/inbox");
        String processedDir = System.getenv().getOrDefault("PROCESSED_DIR", "/data/inbox/processed");
        long pollInterval = Long.parseLong(System.getenv().getOrDefault("POLL_INTERVAL", "5000"));

        System.out.println("Starting CSV Connector...");
        System.out.printf("Config: broker=%s | topic=%s | inbox=%s%n", broker, topic, inboxDir);

        waitForKafka(broker);
        ensureTopic(broker, topic);

        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        KafkaProducer<String, String> producer = new KafkaProducer<>(props);
        Runtime.getRuntime().addShutdownHook(new Thread(producer::close));

        Files.createDirectories(Path.of(processedDir));

        System.out.printf("Polling %s every %dms...%n%n", inboxDir, pollInterval);

        while (true) {
            processNewFiles(producer, topic, Path.of(inboxDir), Path.of(processedDir));
            Thread.sleep(pollInterval);
        }
    }

    private static void processNewFiles(KafkaProducer<String, String> producer, String topic,
                                         Path inbox, Path processed) throws IOException {
        if (!Files.exists(inbox)) return;

        try (Stream<Path> files = Files.list(inbox)) {
            files
                .filter(p -> p.toString().endsWith(".csv"))
                .filter(Files::isRegularFile)
                .sorted()
                .forEach(file -> {
                    try {
                        processFile(producer, topic, file, processed);
                    } catch (Exception e) {
                        System.err.println("Error processing " + file.getFileName() + ": " + e.getMessage());
                    }
                });
        }
    }

    private static void processFile(KafkaProducer<String, String> producer, String topic,
                                     Path file, Path processedDir) throws IOException {
        List<String> lines = Files.readAllLines(file);
        if (lines.size() <= 1) return;

        int count = 0;
        for (int i = 1; i < lines.size(); i++) {
            String line = lines.get(i).trim();
            if (line.isEmpty()) continue;

            String json = csvLineToJson(line);
            if (json == null) continue;

            String key = extractField(line, 0); // sale_id as key
            producer.send(new ProducerRecord<>(topic, key, json));
            count++;
        }

        producer.flush();

        Path target = processedDir.resolve(file.getFileName());
        Files.move(file, target, StandardCopyOption.REPLACE_EXISTING);

        System.out.printf("[%s] %s → topic \"%s\" | %d records%n",
            java.time.Instant.now(), file.getFileName(), topic, count);
    }

    private static String csvLineToJson(String line) {
        try {
            String[] values = line.split(",", -1);
            if (values.length < HEADERS.length) return null;

            ObjectNode node = mapper.createObjectNode();
            node.put("source", "csv");

            for (int i = 0; i < HEADERS.length; i++) {
                String field = HEADERS[i];
                String value = values[i].trim();

                if (NUMERIC_FIELDS.contains(field)) {
                    if (field.equals("quantity")) {
                        node.put(field, Integer.parseInt(value));
                    } else {
                        node.put(field, Double.parseDouble(value));
                    }
                } else {
                    node.put(field, value);
                }
            }

            node.put("ingested_at", java.time.Instant.now().toString());
            return mapper.writeValueAsString(node);
        } catch (Exception e) {
            return null;
        }
    }

    private static String extractField(String line, int index) {
        String[] parts = line.split(",", index + 2);
        return parts.length > index ? parts[index] : "";
    }

    private static void waitForKafka(String broker) throws Exception {
        try (AdminClient admin = AdminClient.create(Map.of("bootstrap.servers", broker))) {
            while (true) {
                try {
                    admin.listTopics().names().get();
                    System.out.println("Kafka is ready");
                    return;
                } catch (Exception e) {
                    System.out.println("Waiting for Kafka...");
                    Thread.sleep(3000);
                }
            }
        }
    }

    private static void ensureTopic(String broker, String topic) throws Exception {
        try (AdminClient admin = AdminClient.create(Map.of("bootstrap.servers", broker))) {
            Set<String> existing = admin.listTopics().names().get();
            if (!existing.contains(topic)) {
                admin.createTopics(List.of(new NewTopic(topic, 3, (short) 1))).all().get();
                System.out.println("Created topic \"" + topic + "\"");
            }
        }
    }
}
