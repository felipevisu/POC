package com.example.Intent.orders;

import java.util.ArrayList;
import java.util.List;

public class IntentProcessor {
    private final List<Intent> executedIntents = new ArrayList<>();

    public void processIntent(Intent intent) {
        System.out.println("Processing: " + intent.getDescription());
        try {
            intent.execute();
            executedIntents.add(intent);
            System.out.println("Successfully processed: " + intent.getDescription());
        } catch (Exception e) {
            System.err.println("Failed to process intent: " + intent.getDescription());
            System.err.println("Error: " + e.getMessage());
        }
    }

    public void undoLastIntent() {
        if (!executedIntents.isEmpty()) {
            Intent lastIntent = executedIntents.remove(executedIntents.size() - 1);
            System.out.println("Undoing: " + lastIntent.getDescription());
            lastIntent.undo();
        }
    }

    public void showIntentHistory() {
        System.out.println("Intent History:");
        for (Intent intent : executedIntents) {
            System.out.println("- " + intent.getDescription());
        }
    }
}
