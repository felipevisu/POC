package com.poc.producer;

import com.poc.events.PageViewEvent;
import com.poc.events.Topics;
import com.poc.events.json.JsonSerializer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Simulates a web frontend: every second it emits a random page-view event,
 * keyed by user id. Keying by user means all events for one user land in the
 * same partition, so a user's events stay in order.
 */
public class ProducerApp {

    private static final Logger log = LoggerFactory.getLogger(ProducerApp.class);

    private static final String[] USERS = {"alice", "bob", "carol", "dave"};
    private static final String[] PAGES = {"/home", "/pricing", "/checkout", "/docs", "/blog"};

    public static void main(String[] args) {
        String bootstrap = System.getenv()
                .getOrDefault("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092");

        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap);
        props.put(ProducerConfig.ACKS_CONFIG, "all"); // wait for the leader to persist

        AtomicBoolean running = new AtomicBoolean(true);
        Thread mainThread = Thread.currentThread();

        // Clean shutdown: flip the flag, interrupt the loop, wait for it to drain
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            log.info("shutdown requested, stopping producer...");
            running.set(false);
            mainThread.interrupt();
            try {
                mainThread.join();
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
        }));

        Random rnd = new Random();

        try (Producer<String, PageViewEvent> producer =
                     new KafkaProducer<>(props, new StringSerializer(), new JsonSerializer<>())) {

            log.info("producing to '{}' on {} (Ctrl-C to stop)", Topics.PAGE_VIEWS, bootstrap);

            while (running.get()) {
                String user = USERS[rnd.nextInt(USERS.length)];
                PageViewEvent event = new PageViewEvent(
                        user,
                        PAGES[rnd.nextInt(PAGES.length)],
                        System.currentTimeMillis());

                ProducerRecord<String, PageViewEvent> record =
                        new ProducerRecord<>(Topics.PAGE_VIEWS, user, event);

                producer.send(record, (metadata, exception) -> {
                    if (exception != null) {
                        log.error("send failed", exception);
                    } else {
                        log.info("sent user={} page={} -> partition={} offset={}",
                                user, event.page(), metadata.partition(), metadata.offset());
                    }
                });

                Thread.sleep(1000);
            }
        } catch (InterruptedException e) {
            // expected on Ctrl-C; fall through to close
            Thread.currentThread().interrupt();
        }
        log.info("producer stopped.");
    }
}
