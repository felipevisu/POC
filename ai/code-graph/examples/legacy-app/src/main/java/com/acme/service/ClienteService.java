package com.acme.service;

import com.acme.client.CotacaoClient;
import com.acme.dao.ClienteDAO;
import java.math.BigDecimal;

public class ClienteService {
    private final ClienteDAO dao = new ClienteDAO();
    private final CotacaoClient cotacao = new CotacaoClient();

    public String buscarNome(String id) throws Exception {
        return dao.nome(id);
    }

    public BigDecimal saldoDisponivel(String id) throws Exception {
        BigDecimal[] s = dao.saldoEBloqueado(id);
        if (dao.isPJ(id)) {
            return s[0];
        }
        return s[0].subtract(s[1]);
    }

    public Object cotacaoDolar() throws Exception {
        return cotacao.buscar("USD");
    }
}
