package ordergenerator;

import java.time.Instant;
import java.util.Properties;
import java.util.Random;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;

public class OrderGenerator {

    public static void main(String[] args) throws Exception {
        String broker = System.getenv().getOrDefault("KAFKA_BROKER", "localhost:9092");
        String topic = System.getenv().getOrDefault("TOPIC_NAME", "raw_orders");
        long interval = Long.parseLong(System.getenv().getOrDefault("GENERATION_INTERVAL", "5000"));

        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                "org.apache.kafka.common.serialization.StringSerializer");
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                "org.apache.kafka.common.serialization.StringSerializer");

        ObjectMapper mapper = new ObjectMapper();
        Random random = new Random();

        int orderId = 1;

        System.out.println("Order generator started, publishing to: " + topic);

        try (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {
            while (true) {

                int userId = random.nextInt(100) + 1;
                int productId = random.nextInt(5) + 1;
                double price = 50 + (random.nextDouble() * 500);
                int quantity = random.nextInt(3) + 1;

                Order order = new Order(orderId, userId, productId, price, quantity, Instant.now().toString());

                String json = mapper.writeValueAsString(order);

                ProducerRecord<String, String> record =
                        new ProducerRecord<>(topic, String.valueOf(orderId), json);

                producer.send(record);
                producer.flush();

                System.out.println("Generated order: " + json);

                orderId++;

                Thread.sleep(interval);
            }
        }

    }
}
