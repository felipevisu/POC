package com.example.usersapi.config;

import com.example.usersapi.service.EncryptionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EncryptionConfig {

    @Bean
    public EncryptionService encryptionService(
            @Value("${encryption.secret-key}") String secretKey,
            @Value("${encryption.hmac-key}") String hmacKey) {
        return new EncryptionService(secretKey, hmacKey);
    }
}
