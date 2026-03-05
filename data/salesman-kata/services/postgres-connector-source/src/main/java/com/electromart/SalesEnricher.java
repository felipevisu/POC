package com.electromart;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.GlobalKTable;
import org.apache.kafka.streams.kstream.KStream;

import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ExecutionException;

public class SalesEnricher {

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String SALES_TOPIC = "electromart.public.sales";
    private static final String PRODUCTS_TOPIC = "electromart.public.products";
    private static final String SALESMEN_TOPIC = "electromart.public.salesmen";
    private static final String STORES_TOPIC = "electromart.public.stores";
    private static final String OUTPUT_TOPIC = "postgres";

    public static void main(String[] args) throws Exception {
        String broker = System.getenv().getOrDefault("KAFKA_BROKER", "kafka:9092");

        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "sales-enricher");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.StringSerde.class);
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.StringSerde.class);

        waitForTopics(broker);

        StreamsBuilder builder = new StreamsBuilder();

        // Reference data as GlobalKTables (fully replicated, supports foreign-key lookup)
        GlobalKTable<String, String> products = builder.globalTable(PRODUCTS_TOPIC);
        GlobalKTable<String, String> salesmen = builder.globalTable(SALESMEN_TOPIC);
        GlobalKTable<String, String> stores = builder.globalTable(STORES_TOPIC);

        // Sales CDC stream
        KStream<String, String> sales = builder.stream(SALES_TOPIC);

        // Enrich: sales → join product → join salesman → join store → publish
        KStream<String, String> enriched = sales
            .filter((key, value) -> value != null)
            .join(products,
                (key, sale) -> toKey("id", sale, "product_id"),
                SalesEnricher::withProduct)
            .join(salesmen,
                (key, sale) -> toKey("id", sale, "salesman_id"),
                SalesEnricher::withSalesman)
            .join(stores,
                (key, sale) -> toKey("id", sale, "store_id"),
                SalesEnricher::withStore);

        enriched.peek((key, value) -> System.out.println("→ postgres | " + value));
        enriched.to(OUTPUT_TOPIC);

        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        Runtime.getRuntime().addShutdownHook(new Thread(streams::close));

        System.out.println("Starting Sales Enricher → topic \"" + OUTPUT_TOPIC + "\"");
        streams.start();
    }

    /**
     * Builds the GlobalKTable key to match Debezium's JSON key format.
     * Debezium with JsonConverter (schemas.enable=false) produces keys like: {"id":1}
     */
    private static String toKey(String pkField, String json, String fkField) {
        try {
            JsonNode node = mapper.readTree(json);
            int fk = node.get(fkField).asInt();
            return "{\"" + pkField + "\":" + fk + "}";
        } catch (Exception e) {
            return "{}";
        }
    }

    private static String withProduct(String saleJson, String productJson) {
        try {
            ObjectNode sale = (ObjectNode) mapper.readTree(saleJson);
            JsonNode product = mapper.readTree(productJson);
            sale.put("product_code", product.get("code").asText());
            sale.put("product_name", product.get("name").asText());
            sale.put("category", product.get("category").asText());
            sale.put("brand", product.get("brand").asText());
            return mapper.writeValueAsString(sale);
        } catch (Exception e) {
            return saleJson;
        }
    }

    private static String withSalesman(String saleJson, String salesmanJson) {
        try {
            ObjectNode sale = (ObjectNode) mapper.readTree(saleJson);
            JsonNode salesman = mapper.readTree(salesmanJson);
            sale.put("salesman_name", salesman.get("name").asText());
            sale.put("salesman_email", salesman.get("email").asText());
            sale.put("region", salesman.get("region").asText());
            return mapper.writeValueAsString(sale);
        } catch (Exception e) {
            return saleJson;
        }
    }

    private static String withStore(String saleJson, String storeJson) {
        try {
            ObjectNode sale = (ObjectNode) mapper.readTree(saleJson);
            JsonNode store = mapper.readTree(storeJson);
            sale.put("store_name", store.get("name").asText());
            sale.put("city", store.get("city").asText());
            sale.put("country", store.get("country").asText());
            sale.put("store_type", store.get("store_type").asText());
            sale.remove("product_id");
            sale.remove("salesman_id");
            sale.remove("store_id");
            return mapper.writeValueAsString(sale);
        } catch (Exception e) {
            return saleJson;
        }
    }

    /**
     * Waits for Debezium to create all CDC topics before starting Kafka Streams.
     */
    private static void waitForTopics(String broker) throws InterruptedException, ExecutionException {
        Set<String> required = Set.of(SALES_TOPIC, PRODUCTS_TOPIC, SALESMEN_TOPIC, STORES_TOPIC);

        try (AdminClient admin = AdminClient.create(Map.of("bootstrap.servers", broker))) {
            while (true) {
                Set<String> existing = admin.listTopics().names().get();
                if (existing.containsAll(required)) {
                    System.out.println("All Debezium topics found: " + required);
                    return;
                }
                System.out.println("Waiting for Debezium topics... found: " + existing.stream()
                    .filter(t -> t.startsWith("electromart."))
                    .toList());
                Thread.sleep(5000);
            }
        }
    }
}
