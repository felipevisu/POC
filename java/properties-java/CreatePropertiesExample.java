import java.util.Properties;

public class CreatePropertiesExample {
    public static void main(String[] args) {
        Properties properties = new Properties();
        properties.setProperty("app.name", "properties-poc");
        properties.setProperty("app.version", "1.0.0");
        properties.setProperty("app.env", "dev");

        properties.forEach((key, value) -> System.out.println(key + "=" + value));
    }
}
