package com.example.Command.userSystem;

import java.util.Queue;
import java.util.Stack;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CommandProcessor {
    private final Queue<Command> pendingCommands;
    private final Stack<Command> executedCommands;
    private final ExecutorService executorService;

    public CommandProcessor() {
        this.pendingCommands = new ConcurrentLinkedQueue<>();
        this.executedCommands = new Stack<>();
        this.executorService = Executors.newFixedThreadPool(5);
    }

    public void addCommand(Command command) {
        pendingCommands.offer(command);
        System.out.println("Command added to queue");
    }

    public void executeNext() {
        Command command = pendingCommands.poll();
        if (command != null) {
            try {
                command.execute();
                executedCommands.push(command);
            } catch (Exception e) {
                System.err.println("Command execution failed: " + e.getMessage());
            }
        }
    }

    public void executeAll() {
        while (!pendingCommands.isEmpty()) {
            executeNext();
        }
    }

    public CompletableFuture<Void> executeAsync(Command command) {
        return CompletableFuture.runAsync(() -> {
            try {
                command.execute();
                synchronized (executedCommands) {
                    executedCommands.push(command);
                }
            } catch (Exception e) {
                System.err.println("Async command failed: " + e.getMessage());
            }
        }, executorService);
    }

    public void undoLast() {
        if (!executedCommands.isEmpty()) {
            Command lastCommand = executedCommands.pop();
            lastCommand.undo();
        }
    }

    public void undoAll() {
        while (!executedCommands.isEmpty()) {
            undoLast();
        }
    }

    public void shutdown() {
        executorService.shutdown();
    }
}
