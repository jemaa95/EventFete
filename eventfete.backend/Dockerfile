# ===== Étape 1 : compilation =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Télécharge les dépendances séparément pour profiter du cache Docker
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ===== Étape 2 : image finale, plus légère =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/eventfete-1.0.0.jar app.jar

# Render fournit le port via la variable d'environnement PORT
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]