import java.util.Properties;

public class SystemPropertiesExample {
    public static void main(String[] args) {
        Properties systemProperties = System.getProperties();

        System.out.println("java.version=" + systemProperties.getProperty("java.version"));
        System.out.println("os.name=" + systemProperties.getProperty("os.name"));
        System.out.println("user.home=" + systemProperties.getProperty("user.home"));
    }
}
