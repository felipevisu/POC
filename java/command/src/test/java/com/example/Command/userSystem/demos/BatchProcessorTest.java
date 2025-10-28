package com.example.Command.userSystem.demos;

import com.example.Command.userSystem.CommandProcessor;
import com.example.Command.userSystem.NotificationService;
import com.example.Command.userSystem.User;
import com.example.Command.userSystem.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BatchProcessorTest {

    static class TestNotificationService extends NotificationService {
        static class Entry {
            final String recipient;
            final String message;
            Entry(String recipient, String message) {
                this.recipient = recipient;
                this.message = message;
            }
        }

        private final List<Entry> sent = new ArrayList<>();

        @Override
        public void send(String recipient, String message) {
            // Don't sleep; just record calls
            sent.add(new Entry(recipient, message));
        }

        public List<Entry> getSent() {
            return sent;
        }
    }

    @Test
    void processBatch_savesAllUsers_andSendsNotifications() {
        // Arrange
        UserRepository repo = new UserRepository();
        TestNotificationService notifications = new TestNotificationService();
        CommandProcessor processor = new CommandProcessor();
        BatchProcessor batch = new BatchProcessor(processor, repo, notifications);

        List<User> users = List.of(
                new User("Alice", "alice@example.com"),
                new User("Bob", "bob@example.com")
        );

        // Act
        batch.processBatch(users);

        // Assert repository state
        assertEquals(2, repo.findAll().size(), "All users should be saved");
        assertNotNull(repo.findAll().get(0).getId(), "Saved user must have an id");
        assertNotNull(repo.findAll().get(1).getId(), "Saved user must have an id");

        // Assert notifications
        assertEquals(2, notifications.getSent().size(), "One notification per user expected");
        assertTrue(
                notifications.getSent().stream().anyMatch(e ->
                        "alice@example.com".equals(e.recipient) && "Welcome!".equals(e.message)),
                "Notification to Alice should be sent with correct message"
        );
        assertTrue(
                notifications.getSent().stream().anyMatch(e ->
                        "bob@example.com".equals(e.recipient) && "Welcome!".equals(e.message)),
                "Notification to Bob should be sent with correct message"
        );

        // Cleanup
        processor.shutdown();
    }

    @Test
    void processBatch_withEmptyList_doesNothing() {
        // Arrange
        UserRepository repo = new UserRepository();
        TestNotificationService notifications = new TestNotificationService();
        CommandProcessor processor = new CommandProcessor();
        BatchProcessor batch = new BatchProcessor(processor, repo, notifications);

        // Act
        batch.processBatch(List.of());

        // Assert
        assertEquals(0, repo.findAll().size(), "No users should be saved");
        assertEquals(0, notifications.getSent().size(), "No notifications should be sent");

        // Cleanup
        processor.shutdown();
    }

    @Test
    void processBatch_allowsNullEmails_butStillProcessesCreate() {
        // Arrange
        UserRepository repo = new UserRepository();
        TestNotificationService notifications = new TestNotificationService();
        CommandProcessor processor = new CommandProcessor();
        BatchProcessor batch = new BatchProcessor(processor, repo, notifications);

        List<User> users = List.of(
                new User("NoEmail", null)
        );

        // Act
        batch.processBatch(users);

        // Assert user saved
        assertEquals(1, repo.findAll().size(), "User should be saved even with null email");
        assertNotNull(repo.findAll().get(0).getId(), "Saved user must have an id");

        // Assert notification recorded with null recipient (current behavior)
        assertEquals(1, notifications.getSent().size(), "A notification call is still made");
        assertNull(notifications.getSent().get(0).recipient, "Recipient can be null per current behavior");
        assertEquals("Welcome!", notifications.getSent().get(0).message);

        // Cleanup
        processor.shutdown();
    }
}