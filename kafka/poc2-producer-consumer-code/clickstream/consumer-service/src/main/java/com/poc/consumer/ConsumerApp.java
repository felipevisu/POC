package com.poc.consumer;

import com.poc.events.PageViewEvent;
import com.poc.events.Topics;
import com.poc.events.json.JsonDeserializer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.List;
import java.util.Properties;

/**
 * Long-running worker: joins the 'clickstream-analytics' consumer group and
 * processes page-view events. The group id is what Kafka uses to remember
 * this worker's committed offset, so it resumes where it left off on restart.
 */
public class ConsumerApp {

    private static final Logger log = LoggerFactory.getLogger(ConsumerApp.class);
    private static final String GROUP_ID = "clickstream-analytics";

    public static void main(String[] args) {
        String bootstrap = System.getenv()
                .getOrDefault("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092");

        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, GROUP_ID);
        // only used the first time this group runs (no committed offset yet)
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true"); // default; explicit here

        KafkaConsumer<String, PageViewEvent> consumer =
                new KafkaConsumer<>(props, new StringDeserializer(), new JsonDeserializer<>(PageViewEvent.class));

        // Clean shutdown: wakeup() makes the blocking poll() throw WakeupException
        Thread mainThread = Thread.currentThread();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            log.info("shutdown requested, waking consumer...");
            consumer.wakeup();
            try {
                mainThread.join();
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
        }));

        try {
            consumer.subscribe(List.of(Topics.PAGE_VIEWS));
            log.info("consuming '{}' as group '{}' on {}", Topics.PAGE_VIEWS, GROUP_ID, bootstrap);

            while (true) {
                ConsumerRecords<String, PageViewEvent> records =
                        consumer.poll(Duration.ofMillis(500));

                for (ConsumerRecord<String, PageViewEvent> r : records) {
                    PageViewEvent event = r.value();
                    log.info("partition={} offset={} user={} page={}",
                            r.partition(), r.offset(), event.userId(), event.page());
                }
            }
        } catch (WakeupException e) {
            // expected during shutdown, ignore
        } finally {
            consumer.close(); // commits final offsets and leaves the group cleanly
            log.info("consumer closed.");
        }
    }
}
