FROM sbtscala/scala-sbt:eclipse-temurin-jammy-21.0.2_13_1.10.0_3.4.2 AS build

WORKDIR /app

COPY build.sbt .
COPY project ./project

RUN sbt update

COPY src ./src

RUN sbt stage

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=build /app/target/universal/stage /app

EXPOSE 8080

CMD ["/app/bin/bitonic-sequence"]