package com.example.Composite.permissions;

import junit.framework.TestCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class RoleTest extends TestCase {
    private ByteArrayOutputStream outContent;

    @BeforeEach
    public void setUp() {
        outContent = new ByteArrayOutputStream();
        System.setOut(new PrintStream(outContent));
    }

    @Test
    public void testSimplePermissionShow() {
        Permission read = new SimplePermission("READ");
        read.show();

        String output = outContent.toString().trim();
        assertEquals("Permission: READ", output);
    }

    @Test
    public void testRoleWithSinglePermission() {
        Role editor = new Role("Editor");
        editor.addPermission(new SimplePermission("WRITE"));
        editor.show();

        String output = outContent.toString().trim();
        assertTrue(output.contains("Role: Editor"));
        assertTrue(output.contains("Permission: WRITE"));
    }

    @Test
    public void testRoleWithMultiplePermissions() {
        Role admin = new Role("Admin");
        admin.addPermission(new SimplePermission("READ"));
        admin.addPermission(new SimplePermission("WRITE"));
        admin.addPermission(new SimplePermission("DELETE"));

        admin.show();
        String output = outContent.toString().trim();

        assertTrue(output.contains("Role: Admin"));
        assertTrue(output.contains("Permission: READ"));
        assertTrue(output.contains("Permission: WRITE"));
        assertTrue(output.contains("Permission: DELETE"));
    }

    @Test
    public void testNestedRoles() {
        Role admin = new Role("Admin");
        admin.addPermission(new SimplePermission("READ"));
        admin.addPermission(new SimplePermission("WRITE"));

        Role userRoles = new Role("UserRoles");
        userRoles.addPermission(admin);

        userRoles.show();
        String output = outContent.toString().trim();

        assertTrue(output.contains("Role: UserRoles"));
        assertTrue(output.contains("Role: Admin"));
        assertTrue(output.contains("Permission: READ"));
        assertTrue(output.contains("Permission: WRITE"));
    }

    @Test
    public void testRemovePermission() {
        Role role = new Role("TestRole");
        Permission read = new SimplePermission("READ");
        Permission write = new SimplePermission("WRITE");

        role.addPermission(read);
        role.addPermission(write);
        role.removePermission(read);

        role.show();
        String output = outContent.toString().trim();

        assertTrue(output.contains("Permission: WRITE"));
        assertFalse(output.contains("Permission: READ"));
    }
}