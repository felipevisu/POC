package main.java;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class DatabaseService {
    private static final String URL = "jdbc:postgresql://postgres:5432/testdb";
    private static final String USER = "admin";
    private static final String PASSWORD = "admin123";

    public void saveCustomer(String name, String encryptedCard){
        Connection connection = DriverManager.getConnection(URL, USER, PASSWORD);
        String sql = "insert into customers(name, credit_card_encrypted) values (?, ?)";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setString(1, name);
        stmt.setString(2, encryptedCard);
        stmt.executeUpdate();
        connection.close();
    }

    public String getEncryptedCard(int id) throws Exception {
        Connection connection = DriverManager.getConnection(URL, USER, PASSWORD);
        String sql = "select credit_card_encrypted from customers where id = ?";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setSInt(1, id);
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            return rs.getString(1);
        }
        connection.close();
        return null;
    }
}
