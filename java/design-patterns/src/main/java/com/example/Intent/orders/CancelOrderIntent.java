package com.example.Intent.orders;

public class CancelOrderIntent implements Intent {
    private final Order order;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;
    private Status previousStatus;

    public CancelOrderIntent(
            Order order,
            OrderService orderService,
            PaymentService paymentService,
            InventoryService inventoryService,
            NotificationService notificationService
    ) {
        this.order = order;
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.inventoryService = inventoryService;
        this.notificationService = notificationService;
    }

    @Override
    public void execute() {
        previousStatus = order.getStatus();
        inventoryService.releaseItems(order.getId());
        paymentService.refundPayment(order.getCustomerId(), order.getAmount());
        orderService.cancelOrder(order.getId());
        notificationService.sendCancellationNotification(order.getCustomerId(), order.getId());
    }

    @Override
    public void undo() {
        // Restore previous state (simplified)
        order.setStatus(previousStatus);
        orderService.createOrder(order);
        paymentService.processPayment(order.getCustomerId(), order.getAmount());
        inventoryService.reserveItems(order.getId());
    }

    @Override
    public String getDescription() {
        return "Cancel order: " + order.getId();
    }
}
