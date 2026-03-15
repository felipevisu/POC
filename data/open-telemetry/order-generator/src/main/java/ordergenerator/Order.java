package ordergenerator;

public class Order {
    public int orderId;
    public int userId;
    public int productId;
    public double price;
    public int quantity;
    public String timestamp;

    public Order(int orderId, int userId, int productId, double price, int quantity, String timestamp) {
        this.orderId = orderId;
        this.userId = userId;
        this.productId = productId;
        this.price = price;
        this.quantity = quantity;
        this.timestamp = timestamp;
    }
}