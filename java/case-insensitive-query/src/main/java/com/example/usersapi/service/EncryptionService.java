package com.example.usersapi.service;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

public class EncryptionService {
    private static final String AES_ALGORITHM = "AES";
    private static final String AES_GCM_CIPHER = "AES/GCM/NoPadding";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final int GCM_IV_LENGTH_BYTES = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;

    private final SecretKey aesKey;
    private final SecretKey hmacKey;

    public EncryptionService(
            String base64AesKey,
            String base64HmacKey
    ) {
        byte[] aesBytes  = Base64.getDecoder().decode(base64AesKey);
        byte[] hmacBytes = Base64.getDecoder().decode(base64HmacKey);

        this.aesKey  = new SecretKeySpec(aesBytes,  AES_ALGORITHM);
        this.hmacKey = new SecretKeySpec(hmacBytes, HMAC_ALGORITHM);
    }

    public String encrypt(String plaintext) {
        try {
            byte[] iv = generateIv();

            Cipher cipher = Cipher.getInstance(AES_GCM_CIPHER);
            cipher.init(Cipher.ENCRYPT_MODE, aesKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] ciphertextWithTag = cipher.doFinal(plaintext.getBytes());

            byte[] combined = new byte[iv.length + ciphertextWithTag.length];
            System.arraycopy(iv,               0, combined, 0,         iv.length);
            System.arraycopy(ciphertextWithTag, 0, combined, iv.length, ciphertextWithTag.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new CryptoException("Encryption failed", e);
        }
    }

    public String decrypt(String base64Ciphertext) {
        try {
            byte[] combined = Base64.getDecoder().decode(base64Ciphertext);

            byte[] iv = Arrays.copyOfRange(combined, 0, GCM_IV_LENGTH_BYTES);
            byte[] ciphertextTag = Arrays.copyOfRange(combined, GCM_IV_LENGTH_BYTES, combined.length);

            Cipher cipher = Cipher.getInstance(AES_GCM_CIPHER);
            cipher.init(Cipher.DECRYPT_MODE, aesKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            return new String(cipher.doFinal(ciphertextTag));
        } catch (Exception e) {
            throw new CryptoException("Decryption failed", e);
        }
    }

    public String hash(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(hmacKey);
            byte[] hmac = mac.doFinal(value.toLowerCase().getBytes());
            return bytesToHex(hmac);
        } catch (Exception e) {
            throw new CryptoException("Hashing failed", e);
        }
    }

    private byte[] generateIv() {
        byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
        new SecureRandom().nextBytes(iv);
        return iv;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public static class CryptoException extends RuntimeException {
        public CryptoException(String message, Throwable cause) {
            super(message, cause);
        }
    }

}