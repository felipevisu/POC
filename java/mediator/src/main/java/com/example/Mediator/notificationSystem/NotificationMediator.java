package com.example.Mediator.notificationSystem;

public interface NotificationMediator {
    void notify(Component sender, String event, Object data);
    void registerComponent(Component component);
}
