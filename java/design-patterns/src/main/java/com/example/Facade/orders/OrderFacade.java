package com.example.Facade.orders;

public class OrderFacade {
    private InventoryService inventory = new InventoryService();;
    private PaymentService payment = new PaymentService();;
    private ShippingService shipping  = new ShippingService();;
    private ShoppingCart cart = new ShoppingCart();;

    public ShoppingCart getCart() {
        return cart;
    }

    public void checkout(String customerId) {
        System.out.println("Placing order...");

        for (CartItem item : cart.getItems()) {
            if (!inventory.checkStock(item.getProduct().getId(), item.getQuantity())) {
                System.out.println("Order failed: Product " + item.getProduct().getId() + " out of stock.");
                return;
            }
        }

        double total = cart.calculateTotal();
        System.out.println("Total price: $" + total);

        if (!payment.processPayment(customerId, total)) {
            System.out.println("Order failed: Payment declined.");
            return;
        }

        for (CartItem item : cart.getItems()) {
            shipping.shipProduct(item.getProduct().getId(), customerId);
        }

        System.out.println("Order placed successfully!");
    }
}
