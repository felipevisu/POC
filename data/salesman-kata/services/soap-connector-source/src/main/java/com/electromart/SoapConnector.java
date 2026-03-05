package com.electromart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.*;
import org.xml.sax.InputSource;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class SoapConnector {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        String broker = System.getenv().getOrDefault("KAFKA_BROKER", "kafka:9092");
        String topic = System.getenv().getOrDefault("KAFKA_TOPIC", "soap");
        String soapUrl = System.getenv().getOrDefault("SOAP_URL", "http://soap-service:8080/sales");
        int pageSize = Integer.parseInt(System.getenv().getOrDefault("PAGE_SIZE", "100"));
        long pollInterval = Long.parseLong(System.getenv().getOrDefault("POLL_INTERVAL", "5000"));

        System.out.println("Starting SOAP Connector...");
        System.out.printf("Config: broker=%s | topic=%s | soap=%s%n", broker, topic, soapUrl);

        waitForKafka(broker);
        ensureTopic(broker, topic);

        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, broker);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        KafkaProducer<String, String> producer = new KafkaProducer<>(props);
        Runtime.getRuntime().addShutdownHook(new Thread(producer::close));

        waitForSoapService(soapUrl);

        String cursor = null;
        System.out.printf("Polling every %dms...%n%n", pollInterval);

        while (true) {
            try {
                cursor = pollAndPublish(producer, topic, soapUrl, cursor, pageSize);
            } catch (Exception e) {
                System.err.println("Poll error: " + e.getMessage());
            }
            Thread.sleep(pollInterval);
        }
    }

    private static String pollAndPublish(KafkaProducer<String, String> producer, String topic,
                                          String soapUrl, String cursor, int pageSize) throws Exception {
        String currentCursor = cursor;
        boolean hasMore = true;

        int totalPublished = 0;

        // Drain all available pages
        while (hasMore) {
            String requestXml = buildRequest(currentCursor, pageSize);
            String responseXml = postSoap(soapUrl, requestXml);

            Document doc = parseXml(responseXml);
            String nextCursor = getTagValue(doc, "sale:nextCursor");
            hasMore = "true".equals(getTagValue(doc, "sale:hasMore"));

            NodeList records = doc.getElementsByTagName("sale:record");
            if (records.getLength() == 0) break;

            for (int i = 0; i < records.getLength(); i++) {
                Element record = (Element) records.item(i);
                String json = recordToJson(record);
                String saleId = getTagValue(record, "sale:saleId");
                producer.send(new ProducerRecord<>(topic, saleId, json));
                totalPublished++;
            }

            producer.flush();
            currentCursor = nextCursor;
        }

        if (totalPublished > 0) {
            System.out.printf("[%s] → topic \"%s\" | %d records | cursor: %s%n",
                java.time.Instant.now(), topic, totalPublished, currentCursor);
        }

        return currentCursor;
    }

    private static String buildRequest(String cursor, int pageSize) {
        String cursorXml = cursor != null ? "<cursor>" + cursor + "</cursor>" : "";
        return String.format("""
            <?xml version="1.0" encoding="UTF-8"?>
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                              xmlns:sale="http://electromart.com/sales">
              <soapenv:Body>
                <sale:GetSalesRequest>
                  %s
                  <pageSize>%d</pageSize>
                </sale:GetSalesRequest>
              </soapenv:Body>
            </soapenv:Envelope>""", cursorXml, pageSize);
    }

    private static String postSoap(String url, String xml) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "text/xml");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(30000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(xml.getBytes(StandardCharsets.UTF_8));
        }

        try (InputStream is = conn.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static Document parseXml(String xml) throws Exception {
        var factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(false);
        var builder = factory.newDocumentBuilder();
        return builder.parse(new InputSource(new StringReader(xml)));
    }

    private static String getTagValue(Node parent, String tagName) {
        if (parent instanceof Document doc) {
            NodeList nodes = doc.getElementsByTagName(tagName);
            return nodes.getLength() > 0 ? nodes.item(0).getTextContent().trim() : null;
        } else if (parent instanceof Element el) {
            NodeList nodes = el.getElementsByTagName(tagName);
            return nodes.getLength() > 0 ? nodes.item(0).getTextContent().trim() : null;
        }
        return null;
    }

    private static final Set<String> NUMERIC_FIELDS = Set.of("quantity", "unitPrice", "totalAmount");

    private static final Map<String, String> FIELD_MAP = Map.ofEntries(
        Map.entry("sale:saleId", "sale_id"),
        Map.entry("sale:productCode", "product_code"),
        Map.entry("sale:productName", "product_name"),
        Map.entry("sale:category", "category"),
        Map.entry("sale:brand", "brand"),
        Map.entry("sale:salesmanName", "salesman_name"),
        Map.entry("sale:salesmanEmail", "salesman_email"),
        Map.entry("sale:region", "region"),
        Map.entry("sale:storeName", "store_name"),
        Map.entry("sale:city", "city"),
        Map.entry("sale:storeType", "store_type"),
        Map.entry("sale:quantity", "quantity"),
        Map.entry("sale:unitPrice", "unit_price"),
        Map.entry("sale:totalAmount", "total_amount"),
        Map.entry("sale:status", "status"),
        Map.entry("sale:saleTimestamp", "sale_timestamp")
    );

    private static String recordToJson(Element record) throws Exception {
        ObjectNode node = mapper.createObjectNode();
        node.put("source", "soap");

        for (var entry : FIELD_MAP.entrySet()) {
            String value = getTagValue(record, entry.getKey());
            if (value == null) continue;

            String jsonField = entry.getValue();
            if (jsonField.equals("quantity")) {
                node.put(jsonField, Integer.parseInt(value));
            } else if (jsonField.equals("unit_price") || jsonField.equals("total_amount")) {
                node.put(jsonField, Double.parseDouble(value));
            } else {
                node.put(jsonField, value);
            }
        }

        node.put("ingested_at", java.time.Instant.now().toString());
        return mapper.writeValueAsString(node);
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

    private static void waitForSoapService(String url) {
        String healthUrl = url.replace("/sales", "/health");
        while (true) {
            try {
                HttpURLConnection conn = (HttpURLConnection) new URL(healthUrl).openConnection();
                conn.setConnectTimeout(3000);
                conn.setReadTimeout(3000);
                if (conn.getResponseCode() == 200) {
                    System.out.println("SOAP service is ready");
                    return;
                }
            } catch (Exception ignored) {}
            System.out.println("Waiting for SOAP service...");
            try { Thread.sleep(3000); } catch (InterruptedException e) { return; }
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
