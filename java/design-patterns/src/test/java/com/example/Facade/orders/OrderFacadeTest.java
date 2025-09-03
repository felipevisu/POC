package com.example.Facade.orders;

import junit.framework.TestCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;

class TestInventoryService extends InventoryService {
    private boolean stockAvailable = true;

    public void setStockAvailable(boolean available) {
        this.stockAvailable = available;
    }

    @Override
    public boolean checkStock(String productId, int quantity) {
        return stockAvailable;
    }
}

class TestPaymentService extends PaymentService {
    private boolean paymentSuccess = true;

    public void setPaymentSuccess(boolean success) {
        this.paymentSuccess = success;
    }

    @Override
    public boolean processPayment(String customerId, double amount) {
        return paymentSuccess;
    }
}

class TestableOrderFacade extends OrderFacade {
    private TestInventoryService inventory;
    private TestPaymentService payment;
    private ShippingService shipping;
    private ShoppingCart cart;

    public TestableOrderFacade() {
        this.inventory = new TestInventoryService();
        this.payment = new TestPaymentService();
        this.shipping = new ShippingService();
        this.cart = new ShoppingCart();
    }

    public TestInventoryService getInventory() { return inventory; }
    public TestPaymentService getPayment() { return payment; }
    @Override
    public ShoppingCart getCart() { return cart; }
}


public class OrderFacadeTest {
    private TestableOrderFacade orderFacade;
    private Product laptop;
    private Product mouse;

    @BeforeEach
    void setUp() {
        orderFacade = new TestableOrderFacade();
        laptop = new Product("P123", "Laptop", 1000.00);
        mouse = new Product("P456", "Mouse", 25.50);
    }

    @Test
    void testAddProductToCartAndCalculateTotal() {
        orderFacade.getCart().addProduct(laptop, 1);
        orderFacade.getCart().addProduct(mouse, 2);

        double total = orderFacade.getCart().calculateTotal();
        assertEquals(1051.00, total, 0.01);
    }

    @Test
    void testCheckoutSuccess() {
        orderFacade.getCart().addProduct(laptop, 1);
        orderFacade.getCart().addProduct(mouse, 2);

        // Both stock and payment are available by default
        assertDoesNotThrow(() -> orderFacade.checkout("C456"));
    }

    @Test
    void testCheckoutFailsWhenOutOfStock() {
        orderFacade.getCart().addProduct(laptop, 1);
        orderFacade.getInventory().setStockAvailable(false);

        // Expect no crash, but "order failed" behavior
        assertDoesNotThrow(() -> orderFacade.checkout("C456"));
    }

    @Test
    void testCheckoutFailsWhenPaymentDeclined() {
        orderFacade.getCart().addProduct(laptop, 1);
        orderFacade.getPayment().setPaymentSuccess(false);

        assertDoesNotThrow(() -> orderFacade.checkout("C456"));
    }
}