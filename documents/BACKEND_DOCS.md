# iBudget Backend Documentation

## 1. Overview
The **iBudget** backend is a RESTful API built with **Spring Boot 3.5.7**. It serves as the core logic layer for the application, handling data persistence, authentication, business rules, and AI integration.

## 2. Technology Stack

- **Framework:** Spring Boot 3.5.7
- **Language:** Java 21
- **Database:** MySQL 8.2
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security + JWT (JSON Web Tokens)
- **Build Tool:** Maven
- **Rate Limiting:** Bucket4j
- **Testing:** JUnit 5, H2 Database (for tests)

## 3. Project Structure (`backend/appvengers`)

The backend follows a standard layered architecture.

```text
src/main/java/com/backend/appvengers/
├── config/             # Configuration classes (Security, WebSocket, CORS)
├── controller/         # REST Controllers (API Endpoints)
├── dto/                # Data Transfer Objects (Request/Response models)
├── entity/             # JPA Entities (Database Tables)
├── repository/         # Spring Data Repositories (DAO Layer)
├── security/           # JWT Filters, UserDetailsService, Auth Logic
├── service/            # Business Logic Services
└── DatabaseConn.java   # Main Application Entry Point
```

## 4. Key Modules & Features

### 4.1 Authentication & Authorization
- **JWT Implementation:** Stateless authentication using Bearer tokens.
- **Security Config:** `SecurityConfig` class handles URL protection rules.
- **Rate Limiting:** Bucket4j integration prevents brute-force attacks on login endpoints.

### 4.2 Data Management (Core)
- **Entities:**
  - `User`: User account details.
  - `Transaction`: Income and expense records.
  - `Budget`: Spending limits and categories.
  - `Savings`: Savings goals and progress.
- **Repositories:** Interfaces extending `JpaRepository` for standard CRUD operations.

### 4.3 Real-time Services
- **WebSockets:** Configured for pushing real-time notifications to the frontend.
- **Email Service:** Uses `spring-boot-starter-mail` for sending verification codes and alerts.

### 4.4 AI Integration
- **Chatbot Controller:** Handles requests from the frontend chat interface.
- **Context Service:** Aggregates user financial data to provide context for the AI model (RAG pattern support).

## 5. API Overview

The API is structured around resource-based endpoints. *(See `API_DOCUMENTATION.md` for full Swagger/OpenAPI specs if available)*.

- `POST /api/auth/*`: Registration, login, token refresh.
- `GET /api/users/*`: User profile management.
- `GET/POST /api/transactions`: Transaction CRUD.
- `GET/POST /api/budgets`: Budget management.
- `GET/POST /api/chat`: Interaction with Bonzi Buddy AI.

## 6. Configuration

### 6.1 Application Properties
Configuration is primarily located in `src/main/resources/application.properties` (or `.yml`).
- **Database Connection:** URL, username, password.
- **JWT Secret:** Key for signing tokens.
- **Mail Server:** SMTP settings.

### 6.2 Environment Variables
Sensitive data is loaded via `.env` file support (`me.paulschwarz:spring-dotenv`).

## 7. Running the Application

### Prerequisites
- JDK 21
- Maven
- MySQL Server (running and configured)

### Commands
- **Run Locally:**
  ```bash
  ./mvnw spring-boot:run
  ```
- **Run Tests:**
  ```bash
  ./mvnw test
  ```
- **Package:**
  ```bash
  ./mvnw package
  ```
