package orderpersistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.sql.*;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Properties;

public class OrderPersistance {

    public static void main(String[] args) throws Exception {
        String broker = System.getenv().getOrDefault("KAFKA_BROKER", "localhost:9092");
        String inputTopic = System.getenv().getOrDefault("INPUT_TOPIC", "parsed_orders");
        String dbUrl = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/orders");
        String dbUser = System.getenv().getOrDefault("DB_USER", "postgres");
        String dbPassword = System.getenv().getOrDefault("DB_PASSWORD", "postgres");

        ObjectMapper mapper = new ObjectMapper();

        Connection conn = connectWithRetry(dbUrl, dbUser, dbPassword);
        initSchema(conn);

        Properties consumerProps = new Properties();
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "order-persistence-group");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(consumerProps)) {
            consumer.subscribe(Collections.singletonList(inputTopic));
            System.out.println("Order persistence started, consuming from: " + inputTopic);

            while (true) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));
                for (ConsumerRecord<String, String> record : records) {
                    try {
                        ParsedOrder order = mapper.readValue(record.value(), ParsedOrder.class);
                        insertOrder(conn, order);
                        System.out.println("Persisted order: " + order.orderId);
                    } catch (Exception e) {
                        System.err.println("Failed to persist record: " + e.getMessage());
                    }
                }
            }
        }
    }

    private static Connection connectWithRetry(String url, String user, String password) {
        int attempts = 0;
        while (true) {
            try {
                Connection conn = DriverManager.getConnection(url, user, password);
                System.out.println("Connected to TimescaleDB.");
                return conn;
            } catch (SQLException e) {
                attempts++;
                System.err.println("DB connection attempt " + attempts + " failed: " + e.getMessage());
                try { Thread.sleep(3000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            }
        }
    }

    private static void initSchema(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    time         TIMESTAMPTZ NOT NULL,
                    order_id     INT         NOT NULL,
                    user_id      INT         NOT NULL,
                    product_id   INT         NOT NULL,
                    price        DOUBLE PRECISION NOT NULL,
                    quantity     INT         NOT NULL,
                    total_price  DOUBLE PRECISION NOT NULL,
                    processed_at TIMESTAMPTZ NOT NULL
                )
                """);
            stmt.execute("SELECT create_hypertable('orders', 'time', if_not_exists => TRUE)");
        }
        System.out.println("Schema initialized.");
    }

    private static void insertOrder(Connection conn, ParsedOrder order) throws SQLException {
        String sql = """
            INSERT INTO orders (time, order_id, user_id, product_id, price, quantity, total_price, processed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """;
        Timestamp time = (order.timestamp != null && !order.timestamp.isEmpty())
            ? Timestamp.from(Instant.parse(order.timestamp))
            : Timestamp.from(Instant.now());
        Timestamp processedAt = (order.processedAt != null && !order.processedAt.isEmpty())
            ? Timestamp.from(Instant.parse(order.processedAt))
            : Timestamp.from(Instant.now());

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setTimestamp(1, time);
            stmt.setInt(2, order.orderId);
            stmt.setInt(3, order.userId);
            stmt.setInt(4, order.productId);
            stmt.setDouble(5, order.price);
            stmt.setInt(6, order.quantity);
            stmt.setDouble(7, order.totalPrice);
            stmt.setTimestamp(8, processedAt);
            stmt.executeUpdate();
        }
    }
}
