# Basic Streams with kafka

### Install Kakfa with maven

```bash
mvn clean install
```

### Run kafka server with docker

```bash
docker pull apache/kafka:4.1.1

docker run -p 9092:9092 apache/kafka:4.1.1

docker exec -it <container-id> /opt/kafka/bin/kafka-topics.sh \
  --create --topic basic-streams \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

```

### Run the components in separate terminals

```bash
mvn exec:java -Dexec.mainClass="com.example.basicstreams.SimpleProducer"
mvn exec:java -Dexec.mainClass="com.example.basicstreams.SimpleProcessor"
mvn exec:java -Dexec.mainClass="com.example.basicstreams.SimpleConsumer"
```
