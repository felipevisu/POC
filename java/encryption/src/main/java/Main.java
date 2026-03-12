package main.java;

public class Main {

    public static void main(String[] args) throws Exception {

        DatabaseService db = new DatabaseService();

        String creditCard = "4111111111111111";

        String encrypted = CryptoUtils.encrypt(creditCard);

        System.out.println("Encrypted: " + encrypted);

        db.saveCustomer("John", encrypted);

        String stored = db.getEncryptedCard(1);

        String decrypted = CryptoUtils.decrypt(stored);

        System.out.println("Decrypted: " + decrypted);
    }
}