package com.electromart;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.KStream;

import java.sql.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

public class SalesAggregator {

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String POSTGRES_TOPIC = "postgres";
    private static final String CSV_TOPIC = "csv";
    private static final String SOAP_TOPIC = "soap";
    private static final String OUTPUT_TOPIC = "sales";

    private static volatile Connection dbConnection;
    private static String dbUrl;
    private static String dbUser;
    private static String dbPassword;

    private static final String INSERT_SQL = """
        INSERT INTO sales (sale_id, source, product_code, product_name, category, brand,
            salesman_name, salesman_email, region, store_name, city, store_type,
            quantity, unit_price, total_amount, status, sale_timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (sale_id, sale_timestamp) DO NOTHING
        """;

    public static void main(String[] args) throws Exception {
        String broker = env("KAFKA_BROKER", "kafka:9092");
        dbUrl = env("TIMESCALEDB_URL", "jdbc:postgresql://timescaledb:5432/salesdb");
        dbUser = env("TIMESCALEDB_USER", "sales");
        dbPassword = env("TIMESCALEDB_PASSWORD", "sales123");

        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "sales-aggregator");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.StringSerde.class);
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.StringSerde.class);

        waitForTopics(broker);
        waitForTimescaleDB();

        StreamsBuilder builder = new StreamsBuilder();

        KStream<String, String> postgres = builder.<String, String>stream(POSTGRES_TOPIC)
            .filter((key, value) -> value != null)
            .mapValues(v -> normalize(v, "postgres"));

        KStream<String, String> csv = builder.<String, String>stream(CSV_TOPIC)
            .filter((key, value) -> value != null)
            .mapValues(v -> normalize(v, "csv"));

        KStream<String, String> soap = builder.<String, String>stream(SOAP_TOPIC)
            .filter((key, value) -> value != null)
            .mapValues(v -> normalize(v, "soap"));

        KStream<String, String> merged = postgres.merge(csv).merge(soap);

        merged.to(OUTPUT_TOPIC);
        merged.foreach((key, value) -> insertSale(value));

        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            streams.close();
            closeDb();
        }));

        System.out.println("Starting Sales Aggregator");
        System.out.println("  Sources: " + POSTGRES_TOPIC + ", " + CSV_TOPIC + ", " + SOAP_TOPIC);
        System.out.println("  Output:  " + OUTPUT_TOPIC + " (Kafka) + TimescaleDB");
        streams.start();
    }

    static String normalize(String json, String defaultSource) {
        try {
            ObjectNode node = (ObjectNode) mapper.readTree(json);

            if (!node.has("source")) {
                node.put("source", defaultSource);
            }

            JsonNode saleId = node.get("sale_id");
            if (saleId != null && saleId.isNumber()) {
                node.put("sale_id", "PG-" + saleId.asLong());
            }

            if (node.has("sale_date") && !node.has("sale_timestamp")) {
                node.set("sale_timestamp", node.get("sale_date"));
                node.remove("sale_date");
            }

            JsonNode ts = node.get("sale_timestamp");
            if (ts != null && ts.isNumber()) {
                node.put("sale_timestamp", Instant.ofEpochMilli(ts.asLong()).toString());
            }

            if (!node.has("ingested_at")) {
                node.put("ingested_at", Instant.now().toString());
            }

            node.remove("created_at");
            node.remove("updated_at");

            return mapper.writeValueAsString(node);
        } catch (Exception e) {
            return json;
        }
    }

    private static synchronized void insertSale(String json) {
        try {
            JsonNode node = mapper.readTree(json);

            Connection conn = getConnection();
            try (PreparedStatement ps = conn.prepareStatement(INSERT_SQL)) {
                ps.setString(1, node.get("sale_id").asText());
                ps.setString(2, node.path("source").asText("unknown"));
                ps.setString(3, node.path("product_code").asText());
                ps.setString(4, node.path("product_name").asText());
                ps.setString(5, node.path("category").asText());
                ps.setString(6, node.path("brand").asText());
                ps.setString(7, node.path("salesman_name").asText());
                ps.setString(8, node.path("salesman_email").asText());
                ps.setString(9, node.path("region").asText());
                ps.setString(10, node.path("store_name").asText());
                ps.setString(11, node.path("city").asText());
                ps.setString(12, node.path("store_type").asText());
                ps.setInt(13, node.path("quantity").asInt(0));
                ps.setDouble(14, node.path("unit_price").asDouble(0));
                ps.setDouble(15, node.path("total_amount").asDouble(0));
                ps.setString(16, node.path("status").asText());
                ps.setTimestamp(17, parseTimestamp(node.path("sale_timestamp").asText()));

                ps.executeUpdate();
            }
        } catch (Exception e) {
            System.err.println("Insert error: " + e.getMessage());
            closeDb();
        }
    }

    private static Timestamp parseTimestamp(String value) {
        try {
            return Timestamp.from(Instant.parse(value));
        } catch (Exception e) {
            LocalDateTime ldt = LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            return Timestamp.from(ldt.toInstant(ZoneOffset.UTC));
        }
    }

    private static Connection getConnection() throws SQLException {
        if (dbConnection == null || dbConnection.isClosed()) {
            dbConnection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
        }
        return dbConnection;
    }

    private static void closeDb() {
        try {
            if (dbConnection != null && !dbConnection.isClosed()) dbConnection.close();
        } catch (Exception ignored) {}
        dbConnection = null;
    }

    private static void waitForTimescaleDB() {
        while (true) {
            try {
                dbConnection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                System.out.println("TimescaleDB is ready");
                return;
            } catch (Exception e) {
                System.out.println("Waiting for TimescaleDB...");
                sleep(3000);
            }
        }
    }

    private static void waitForTopics(String broker) throws Exception {
        Set<String> required = Set.of(POSTGRES_TOPIC, CSV_TOPIC, SOAP_TOPIC);
        try (AdminClient admin = AdminClient.create(Map.of("bootstrap.servers", broker))) {
            while (true) {
                Set<String> existing = admin.listTopics().names().get();
                if (existing.containsAll(required)) {
                    System.out.println("All source topics found: " + required);
                    return;
                }
                System.out.println("Waiting for topics... found so far: " +
                    existing.stream().filter(required::contains).toList());
                sleep(5000);
            }
        }
    }

    private static String env(String key, String def) {
        return System.getenv().getOrDefault(key, def);
    }

    private static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
