package com.example.Mediator.notificationSystem;

public class SMSService extends Component {
    public SMSService(NotificationMediator mediator) {
        super(mediator);
    }
    public void sendPaymentAlert(String userId) {
        System.out.println("[SMS] Sending payment alert to user: " + userId);
    }
}
