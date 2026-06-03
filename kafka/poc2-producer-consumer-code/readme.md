**Run kafka**

```bash
docker compose up -d
```

**Run Consumer**

```bash
mvn -pl consumer-service exec:java
```

**Run Producer**

```bash
mvn -pl producer-service exec:java
```
