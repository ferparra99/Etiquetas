FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/cables-0.1.0.jar app.jar
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENV LOG_DIR=/app/logs
EXPOSE 8080
ENTRYPOINT ["./docker-entrypoint.sh"]
