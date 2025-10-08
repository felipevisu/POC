package com.example.Mediator.notificationSystem;

public abstract class Component {
    protected NotificationMediator mediator;

    public Component(NotificationMediator mediator){
        this.mediator = mediator;
    }
}
