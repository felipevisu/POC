package com.acme.dao;

import java.math.BigDecimal;
import java.sql.*;

public class ClienteDAO {
    private static final String SQL_SALDO = "SELECT SALDO, BLOQUEADO FROM CONTA WHERE CLIENTE_ID = ?";

    public String nome(String id) throws SQLException {
        try (Connection c = Db.get(); PreparedStatement ps = c.prepareStatement("SELECT NOME FROM CLIENTE WHERE ID = ?")) {
            ps.setString(1, id);
            ResultSet rs = ps.executeQuery();
            return rs.next() ? rs.getString("NOME") : null;
        }
    }

    public BigDecimal[] saldoEBloqueado(String id) throws SQLException {
        try (Connection c = Db.get(); PreparedStatement ps = c.prepareStatement(SQL_SALDO)) {
            ps.setString(1, id);
            ResultSet rs = ps.executeQuery();
            rs.next();
            return new BigDecimal[] { rs.getBigDecimal("SALDO"), rs.getBigDecimal("BLOQUEADO") };
        }
    }

    public boolean isPJ(String id) throws SQLException {
        return id.length() == 14;
    }
}
