package com.example.Proxy.accessControl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserServiceProxyTest {

    private UserServiceImpl realService;

    @BeforeEach
    void setUp() {
        realService = new UserServiceImpl();
    }

    @Test
    void testAdminAccessShouldReturnData() {
        UserService proxy = new UserServiceProxy(realService, "ADMIN");

        String result = proxy.getUserData("123");

        assertTrue(result.contains("Sensitive data of user 123"),
                "Admin should have access to user data");
    }

    @Test
    void testGuestAccessShouldBeDenied() {
        UserService proxy = new UserServiceProxy(realService, "GUEST");

        String result = proxy.getUserData("456");

        assertEquals("Access Denied", result,
                "Guest should not have access to user data");
    }

    @Test
    void testNullRoleShouldBeDenied() {
        UserService proxy = new UserServiceProxy(realService, null);

        String result = proxy.getUserData("789");

        assertEquals("Access Denied", result,
                "Null role should not have access");
    }
}
