package com.example.ChainOfResponsability.authService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static junit.framework.Assert.*;

public class AuthServiceTest {
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService();
    }

    @Test
    @DisplayName("Should fail when token is null")
    void shouldFailWhenTokenIsNull() {
        AuthResult result = authService.authenticate(
                null, "user_admin_john", "users", "read"
        );

        assertFalse(result.isSuccess());
        assertEquals("Token is empty", result.getMessage());
    }

    @Test
    @DisplayName("Should fail when token is empty")
    void shouldFailWhenTokenIsEmpty() {
        AuthResult result = authService.authenticate(
                "", "user_admin_john", "users", "read"
        );

        assertFalse(result.isSuccess());
        assertEquals("Token is empty", result.getMessage());
    }

    @Test
    @DisplayName("Should fail when token is invalid")
    void shouldFailWhenTokenIsInvalid() {
        AuthResult result = authService.authenticate(
                "invalid_token", "user_admin_john", "users", "read"
        );

        assertFalse(result.isSuccess());
        assertEquals("Invalid token", result.getMessage());
    }

    @Test
    @DisplayName("Should pass token validation with valid token")
    void shouldPassTokenValidationWithValidToken() {
        // This test will fail at user authentication, but token validation should pass
        AuthResult result = authService.authenticate(
                "valid_token_12345", null, "users", "read"
        );

        assertFalse(result.isSuccess());
        assertEquals("User id is empty", result.getMessage());
    }

    @Test
    @DisplayName("Should fail when user ID is null")
    void shouldFailWhenUserIdIsNull() {
        AuthResult result = authService.authenticate(
                "valid_token_12345", null, "users", "read"
        );

        assertFalse(result.isSuccess());
        assertEquals("User id is empty", result.getMessage());
    }

    @Test
    @DisplayName("Should fail when user ID is empty")
    void shouldFailWhenUserIdIsEmpty() {
        AuthResult result = authService.authenticate(
                "valid_token_12345", "", "users", "read"
        );

        assertFalse(result.isSuccess());
        assertEquals("User id is empty", result.getMessage());
    }

    @Test
    @DisplayName("Should fail when user doesn't exist")
    void shouldFailWhenUserDoesntExist() {
        AuthResult result = authService.authenticate(
                "valid_token_12345", "invalid_user", "users", "read"
        );

        assertFalse(result.isSuccess());
        assertEquals("User not found", result.getMessage());
    }

    @Test
    @DisplayName("Should allow admin users to perform any action")
    void shouldAllowAdminUsersToPerformAnyAction() {
        AuthResult result = authService.authenticate(
                "valid_token_12345", "user_admin_john", "sensitive_data", "delete"
        );

        assertTrue(result.isSuccess());
        assertEquals("Access granted", result.getMessage());
    }

    @Test
    @DisplayName("Should allow all users to read users")
    void shouldAllowAllUsersToReadUsers() {
        AuthResult result = authService.authenticate(
                "valid_token_12345", "user_regular_bob", "users", "read"
        );

        assertTrue(result.isSuccess());
        assertEquals("Access granted", result.getMessage());
    }
}