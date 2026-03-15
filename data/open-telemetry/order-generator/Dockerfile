FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src/ ./src/
RUN mvn package -DskipTests
RUN curl -L -o /otel-javaagent.jar \
    https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /app/target/order-generator-1.0.0.jar app.jar
COPY --from=build /otel-javaagent.jar /otel-javaagent.jar

ENV JAVA_OPTS="-Xms32M -Xmx64M"
CMD java $JAVA_OPTS -javaagent:/otel-javaagent.jar -jar app.jar
