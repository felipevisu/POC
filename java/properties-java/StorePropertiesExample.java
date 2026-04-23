import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

public class StorePropertiesExample {
    public static void main(String[] args) throws IOException {
        Properties properties = new Properties();
        properties.setProperty("app.name", "properties-poc");
        properties.setProperty("app.version", "1.0.0");
        properties.setProperty("app.env", "dev");

        try (FileOutputStream output = new FileOutputStream("store.properties")) {
            properties.store(output, null);
        }

        System.out.println("store.properties created");
    }
}
