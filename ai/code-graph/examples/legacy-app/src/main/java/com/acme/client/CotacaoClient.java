package com.acme.client;

import java.net.HttpURLConnection;
import java.net.URL;

public class CotacaoClient {
    private static final String BASE = "https://api.cambio.example/v1";

    public Object buscar(String moeda) throws Exception {
        HttpURLConnection con = (HttpURLConnection) new URL(BASE + "/cotacao/" + moeda).openConnection();
        con.setRequestMethod("GET");
        return new com.fasterxml.jackson.databind.ObjectMapper().readValue(con.getInputStream(), Cotacao.class);
    }

    public static class Cotacao { public BigDecimalHolder valor; }
    public static class BigDecimalHolder {}
}
