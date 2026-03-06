package com.electromart;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import io.minio.*;
import io.minio.messages.Item;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

public class CsvConnector {

    private static final ObjectMapper mapper = new ObjectMapper();
    private static final AtomicLong filesProcessed = new AtomicLong(0);
    private static final AtomicLong recordsProcessed = new AtomicLong(0);

    private static final String LINEAGE_TOPIC = "lineage";
    private static final String COMPONENT_NAME = "csv-connector";

    private static final String[] HEADERS = {
        "sale_id", "product_code", "product_name", "category", "brand",
        "salesman_name", "salesman_email", "region", "store_name", "city",
        "store_type", "quantity", "unit_price", "total_amount", "status", "sale_date"
    };

    private static final Set<String> NUMERIC_FIELDS = Set.of("quantity", "unit_price", "total_amount");

    private static KafkaProducer<String, String> producer;
    private static MinioClient minioClient;
    private static String kafkaTopic;
    private static String sourceBucket;
    private static String processedBucket;
    private static boolean lineageEnabled;

    public static void main(String[] args) throws Exception {
        String broker = System.getenv().getOrDefault("KAFKA_BROKER", "kafka:9092");
        kafkaTopic = System.getenv().getOrDefault("KAFKA_TOPIC", "csv");
        String minioEndpoint = System.getenv().getOrDefault("MINIO_ENDPOINT", "http://minio:9000");
        String minioAccessKey = System.getenv().getOrDefault("MINIO_ACCESS_KEY", "minioadmin");
        String minioSecretKey = System.getenv().getOrDefault("MINIO_SECRET_KEY", "minioadmin123");
        sourceBucket = System.getenv().getOrDefault("MINIO_BUCKET", "sales-csv");
        processedBucket = System.getenv().getOrDefault("MINIO_PROCESSED_BUCKET", "sales-csv-processed");
        int webhookPort = Integer.parseInt(System.getenv().getOrDefault("WEBHOOK_PORT", "8085"));
        lineageEnabled = Boolean.parseBoolean(System.getenv().getOrDefault("LINEAGE_ENABLED", "true"));

        System.out.println("╔═══════════════════════════════════════════════════════════╗");
        System.out.println("║     CSV Connector Source - MinIO Event-Driven Edition     ║");
        System.out.println("╚═══════════════════════════════════════════════════════════╝");
        System.out.printf("Kafka: %s | Topic: %s%n", broker, kafkaTopic);
        System.out.printf("MinIO: %s | Bucket: %s%n", minioEndpoint, sourceBucket);
        System.out.printf("Webhook Port: %d%n%n", webhookPort);

        // Initialize MinIO client
        minioClient = MinioClient.builder()
            .endpoint(minioEndpoint)
            .credentials(minioAccessKey, minioSecretKey)
            .build();

        waitForMinio();
        waitForKafka(broker);
        ensureTopic(broker, kafkaTopic);
        if (lineageEnabled) {
            ensureTopic(broker, LINEAGE_TOPIC);
            System.out.println("Lineage tracking: ENABLED");
        }

        // Initialize Kafka producer
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, "all");

        producer = new KafkaProducer<>(props);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\nShutting down...");
            producer.close();
        }));

        processExistingFiles();

        startWebhookServer(webhookPort);

        System.out.println("\n✓ Ready! Listening for MinIO events on port " + webhookPort);
        System.out.println("═══════════════════════════════════════════════════════════════\n");

        Thread.currentThread().join();
    }

    private static void startWebhookServer(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        
        server.createContext("/health", exchange -> {
            String response = "{\"status\":\"healthy\",\"files\":" + filesProcessed.get() + 
                             ",\"records\":" + recordsProcessed.get() + "}";
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length());
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        });

        server.createContext("/minio/events", exchange -> {
            if ("POST".equals(exchange.getRequestMethod())) {
                handleMinioEvent(exchange);
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        });

        server.createContext("/", exchange -> {
            if ("POST".equals(exchange.getRequestMethod())) {
                handleMinioEvent(exchange);
            } else {
                String response = "CSV Connector - MinIO Event Listener";
                exchange.sendResponseHeaders(200, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }
        });

        server.setExecutor(null);
        server.start();
    }

    private static void handleMinioEvent(HttpExchange exchange) throws IOException {
        try {
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            
            if (body.isEmpty()) {
                exchange.sendResponseHeaders(200, 0);
                exchange.getResponseBody().close();
                return;
            }

            JsonNode event = mapper.readTree(body);
            
            JsonNode records = event.get("Records");
            if (records != null && records.isArray()) {
                for (JsonNode record : records) {
                    String eventName = record.path("eventName").asText("");
                    
                    if (eventName.startsWith("s3:ObjectCreated:")) {
                        String bucket = record.path("s3").path("bucket").path("name").asText();
                        String key = record.path("s3").path("object").path("key").asText();
                        
                        key = URLDecoder.decode(key, StandardCharsets.UTF_8);
                        
                        if (key.endsWith(".csv") && bucket.equals(sourceBucket)) {
                            System.out.printf("[%s] ⚡ Event received: %s/%s%n", 
                                Instant.now(), bucket, key);
                            processFile(bucket, key);
                        }
                    }
                }
            }

            exchange.sendResponseHeaders(200, 0);
            exchange.getResponseBody().close();
            
        } catch (Exception e) {
            System.err.println("Error handling MinIO event: " + e.getMessage());
            exchange.sendResponseHeaders(500, 0);
            exchange.getResponseBody().close();
        }
    }

    private static void processExistingFiles() {
        System.out.println("Checking for existing files in bucket...");
        try {
            Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder()
                    .bucket(sourceBucket)
                    .build()
            );

            int count = 0;
            for (Result<Item> result : results) {
                Item item = result.get();
                String key = item.objectName();
                if (key.endsWith(".csv")) {
                    System.out.printf("  Found existing file: %s%n", key);
                    processFile(sourceBucket, key);
                    count++;
                }
            }
            
            if (count > 0) {
                System.out.printf("Processed %d existing file(s)%n", count);
            } else {
                System.out.println("No existing CSV files found");
            }
        } catch (Exception e) {
            System.err.println("Error listing existing files: " + e.getMessage());
        }
    }

    private static void processFile(String bucket, String key) {
        long startTime = System.currentTimeMillis();
        try {
            GetObjectResponse response = minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .build()
            );

            BufferedReader reader = new BufferedReader(new InputStreamReader(response, StandardCharsets.UTF_8));
            List<String> lines = reader.lines().toList();
            reader.close();

            if (lines.size() <= 1) {
                System.out.printf("  Skipping empty file: %s%n", key);
                return;
            }

            int count = 0;
            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i).trim();
                if (line.isEmpty()) continue;

                String traceId = generateTraceId();
                String saleId = extractField(line, 0);
                long recordStart = System.currentTimeMillis();

                String json = csvLineToJson(line, traceId);
                if (json == null) continue;

                producer.send(new ProducerRecord<>(kafkaTopic, saleId, json));
                
                if (lineageEnabled) {
                    emitLineage(traceId, saleId, "ingestion", "received", 
                        "minio:" + bucket, null, 0, key);
                    emitLineage(traceId, saleId, "ingestion", "published", 
                        null, kafkaTopic, System.currentTimeMillis() - recordStart, null);
                }
                count++;
            }

            producer.flush();

            moveToProcessed(bucket, key);

            filesProcessed.incrementAndGet();
            recordsProcessed.addAndGet(count);

            long latency = System.currentTimeMillis() - startTime;
            System.out.printf("[%s] ✓ %s → topic \"%s\" | %d records | %dms%n",
                Instant.now(), key, kafkaTopic, count, latency);

        } catch (Exception e) {
            System.err.println("Error processing file " + key + ": " + e.getMessage());
        }
    }

    private static void moveToProcessed(String bucket, String key) {
        try {
            minioClient.copyObject(
                CopyObjectArgs.builder()
                    .bucket(processedBucket)
                    .object(key)
                    .source(CopySource.builder()
                        .bucket(bucket)
                        .object(key)
                        .build())
                    .build()
            );

            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .build()
            );
        } catch (Exception e) {
            System.err.println("Error moving file to processed: " + e.getMessage());
        }
    }

    private static String csvLineToJson(String line, String traceId) {
        try {
            String[] values = line.split(",", -1);
            if (values.length < HEADERS.length) return null;

            ObjectNode node = mapper.createObjectNode();
            node.put("trace_id", traceId);
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

            node.put("ingested_at", Instant.now().toString());
            return mapper.writeValueAsString(node);
        } catch (Exception e) {
            return null;
        }
    }

    private static String generateTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private static void emitLineage(String traceId, String saleId, String stage, 
                                     String eventType, String sourceTopic, 
                                     String targetTopic, long latencyMs, String metadata) {
        try {
            ObjectNode event = mapper.createObjectNode();
            event.put("trace_id", traceId);
            event.put("sale_id", saleId);
            event.put("stage", stage);
            event.put("component", COMPONENT_NAME);
            event.put("event_type", eventType);
            event.put("timestamp", Instant.now().toString());
            if (sourceTopic != null) event.put("source_topic", sourceTopic);
            if (targetTopic != null) event.put("target_topic", targetTopic);
            if (latencyMs > 0) event.put("latency_ms", latencyMs);
            if (metadata != null) event.put("metadata", metadata);

            producer.send(new ProducerRecord<>(LINEAGE_TOPIC, traceId, mapper.writeValueAsString(event)));
        } catch (Exception e) {
            // Ignore lineage errors
        }
    }

    private static String extractField(String line, int index) {
        String[] parts = line.split(",", index + 2);
        return parts.length > index ? parts[index] : "";
    }

    private static void waitForMinio() throws Exception {
        System.out.println("Waiting for MinIO...");
        while (true) {
            try {
                minioClient.bucketExists(BucketExistsArgs.builder().bucket(sourceBucket).build());
                System.out.println("MinIO is ready");
                return;
            } catch (Exception e) {
                System.out.println("MinIO not ready: " + e.getMessage());
                Thread.sleep(3000);
            }
        }
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
