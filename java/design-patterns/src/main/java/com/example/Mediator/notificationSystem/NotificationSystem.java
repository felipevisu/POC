package com.example.Mediator.notificationSystem;

public class NotificationSystem implements NotificationMediator {
    private EmailService emailService;
    private SMSService smsService;

    @Override
    public void registerComponent(Component component) {
        if(component instanceof EmailService){
            this.emailService = (EmailService) component;
        }
        if(component instanceof  SMSService){
            this.smsService = (SMSService) component;
        }
    }

    @Override
    public void notify(Component sender, String event, Object data) {
        switch (event) {
            case "ORDER_PLACED":
                if (emailService != null && sender != emailService) {
                    emailService.sendOrderConfirmation((String) data);
                }
                break;
            case "PAYMENT_FAILED":
                if (emailService != null && sender != emailService) {
                    emailService.sendPaymentFailedNotification((String) data);
                }
                if (smsService != null && sender != smsService) {
                    smsService.sendPaymentAlert((String) data);
                }
                break;
        }
    }
}
