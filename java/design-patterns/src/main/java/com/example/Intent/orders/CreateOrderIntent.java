package com.example.Intent.orders;

public class CreateOrderIntent implements Intent {
    private final Order order;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    public CreateOrderIntent(
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
        orderService.createOrder(order);
        paymentService.processPayment(order.getCustomerId(), order.getAmount());
        inventoryService.reserveItems(order.getId());
        notificationService.sendOrderConfirmation(order.getCustomerId(), order.getId());
    }

    @Override
    public void undo() {
        orderService.cancelOrder(order.getId());
        paymentService.refundPayment(order.getCustomerId(), order.getAmount());
        inventoryService.releaseItems(order.getId());
        notificationService.sendCancellationNotification(order.getCustomerId(), order.getId());
    }

    @Override
    public String getDescription() {
        return "Create order: " + order.getId() + " for customer: " + order.getCustomerId();
    }
}
