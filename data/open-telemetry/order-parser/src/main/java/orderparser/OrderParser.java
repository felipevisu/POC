package orderparser;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;

import java.time.Instant;
import java.time.Duration;
import java.util.Collections;
import java.util.Properties;

public class OrderParser {

    public static void main(String[] args) throws Exception {

        String broker = System.getenv().getOrDefault("KAFKA_BROKER", "localhost:9092");
        String inputTopic = System.getenv().getOrDefault("INPUT_TOPIC", "raw_orders");
        String outputTopic = System.getenv().getOrDefault("OUTPUT_TOPIC", "parsed_orders");

        ObjectMapper mapper = new ObjectMapper();

        Properties consumerProps = new Properties();

        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "order-parser-group");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(consumerProps);
        consumer.subscribe(Collections.singletonList(inputTopic));

        Properties producerProps = new Properties();

        producerProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        producerProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        producerProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        KafkaProducer<String, String> producer = new KafkaProducer<>(producerProps);

        System.out.println("Order parser started...");

        while (true) {

            ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));

            for (ConsumerRecord<String, String> record : records) {

                Order order = mapper.readValue(record.value(), Order.class);

                ParsedOrder parsed = new ParsedOrder();

                parsed.orderId = order.orderId;
                parsed.userId = order.userId;
                parsed.productId = order.productId;
                parsed.price = order.price;
                parsed.quantity = order.quantity;

                parsed.totalPrice = order.price * order.quantity;

                parsed.timestamp = order.timestamp;
                parsed.processedAt = Instant.now().toString();

                String json = mapper.writeValueAsString(parsed);

                producer.send(new ProducerRecord<>(outputTopic, String.valueOf(parsed.orderId), json));

                System.out.println("Processed order: " + json);
            }
        }
    }
}