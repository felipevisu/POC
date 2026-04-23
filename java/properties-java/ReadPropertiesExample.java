import java.io.IOException;
import java.io.StringReader;
import java.util.Properties;

public class ReadPropertiesExample {
    public static void main(String[] args) throws IOException {
        String content = "app.name=properties-poc\napp.version=1.0.0\napp.env=dev";

        Properties properties = new Properties();
        properties.load(new StringReader(content));

        System.out.println(properties.getProperty("app.name"));
        System.out.println(properties.getProperty("app.version"));
        System.out.println(properties.getProperty("app.env"));
    }
}
