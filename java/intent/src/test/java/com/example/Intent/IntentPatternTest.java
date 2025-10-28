package com.example.Intent;

import com.example.Intent.orders.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;

public class IntentPatternTest {
    @Mock
    private OrderService orderService;

    @Mock
    private PaymentService paymentService;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private NotificationService notificationService;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testOrder = new Order("ORD-001", "CUST-123", 99.99);
    }

    @Nested
    @DisplayName("CreateOrderIntent test")
    class CreateOrderIntentTest {
        private CreateOrderIntent createOrderIntent;

        @BeforeEach
        void setUp(){
            createOrderIntent = new CreateOrderIntent(
                    testOrder, orderService, paymentService, inventoryService, notificationService
            );
        }

        @Test
        @DisplayName("Execute all services in correct order")
        void executeAllServicesInCorrectOrder() {
            // When
            createOrderIntent.execute();

            // Then
            verify(orderService).createOrder(testOrder);
            verify(paymentService).processPayment(testOrder.getCustomerId(), testOrder.getAmount());
            verify(inventoryService).reserveItems(testOrder.getId());
            verify(notificationService).sendOrderConfirmation(testOrder.getCustomerId(), testOrder.getId());

            // Verify order of execution
            InOrder inOrder = inOrder(orderService, paymentService, inventoryService, notificationService);
            inOrder.verify(orderService).createOrder(testOrder);
            inOrder.verify(paymentService).processPayment(testOrder.getCustomerId(), testOrder.getAmount());
            inOrder.verify(inventoryService).reserveItems(testOrder.getId());
            inOrder.verify(notificationService).sendOrderConfirmation(testOrder.getCustomerId(), testOrder.getId());
        }
    }
}
