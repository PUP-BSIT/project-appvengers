# iBudget Backend Documentation

## 1. Overview
The **iBudget** backend is a RESTful API built with **Spring Boot 3.5.7**. It serves as the core logic layer for the application, handling data persistence, authentication, business rules, and AI integration.

## 2. Technology Stack

- **Framework:** Spring Boot 3.5.7
- **Language:** Java 21
- **Database:** MySQL 8.2
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security + JWT (JSON Web Tokens) + OAuth2 (Google)
- **Build Tool:** Maven
- **Rate Limiting:** Bucket4j
- **Email:** Spring Mail (SMTP)
- **Testing:** JUnit 5, H2 Database (for tests)
- **Real-time:** WebSocket support for notifications

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
├── interceptor/        # HTTP Interceptors
├── service/            # Business Logic Services
└── DatabaseConn.java   # Main Application Entry Point
```

## 3.1 Backend Architecture Layers

The iBudget backend implements a **layered architecture** pattern, ensuring separation of concerns, maintainability, and scalability. Each layer has specific responsibilities and communicates only with adjacent layers.

### Layer 1: Presentation Layer (Controller)
**Purpose:** Handle HTTP requests and responses, route to appropriate services.

**Components:**
- REST Controllers (`@RestController`)
- Request mappings (`@GetMapping`, `@PostMapping`, etc.)
- Input validation (`@Valid`)
- Exception handling

**Responsibilities:**
- Receive HTTP requests from frontend
- Validate request data (basic validation)
- Call appropriate service methods
- Transform service responses to HTTP responses (JSON)
- Handle HTTP status codes and error responses

**Data Flow:**
```
Client Request → Controller → Service Layer
Client Response ← Controller ← Service Layer
```

**Example:**
```java
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;
    
    @PostMapping
    public ResponseEntity<Transaction> create(@Valid @RequestBody TransactionDTO dto) {
        return ResponseEntity.ok(transactionService.createTransaction(dto));
    }
}
```

### Layer 2: Service Layer (Business Logic)
**Purpose:** Implement core business logic and orchestrate data operations.

**Components:**
- Service classes (`@Service`)
- Business logic methods
- Transaction management (`@Transactional`)
- Data validation and transformation

**Responsibilities:**
- Implement business rules and logic
- Coordinate multiple repository calls
- Handle complex calculations (budgets, savings, analytics)
- Perform data validation and sanitization
- Manage transactions (ACID properties)
- Call external services (Email, AI Chatbot)

**Data Flow:**
```
Controller → Service → Repository
Controller ← Service ← Repository
Service → External Services (Email, N8N Webhook)
```

**Example:**
```java
@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    
    @Transactional
    public Transaction createTransaction(TransactionDTO dto) {
        // Business logic: validate, calculate, save
        Category category = categoryService.findById(dto.getCategoryId());
        Transaction transaction = new Transaction();
        // ... business logic
        return transactionRepository.save(transaction);
    }
}
```

### Layer 3: Repository Layer (Data Access)
**Purpose:** Abstract database operations and provide data access interface.

**Components:**
- JPA Repository interfaces (`extends JpaRepository`)
- Custom query methods
- Native queries (`@Query`)

**Responsibilities:**
- CRUD operations (Create, Read, Update, Delete)
- Custom database queries
- Data persistence and retrieval
- Database transaction coordination

**Data Flow:**
```
Service → Repository → Database
Service ← Repository ← Database
```

**Example:**
```java
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
}
```

### Layer 4: Entity Layer (Data Model)
**Purpose:** Define database schema and object-relational mapping.

**Components:**
- JPA Entities (`@Entity`)
- Entity relationships (`@OneToMany`, `@ManyToOne`)
- Field mappings (`@Column`, `@Id`, `@GeneratedValue`)

**Responsibilities:**
- Define database table structure
- Map Java objects to database tables
- Define entity relationships
- Specify constraints and validation rules

**Example:**
```java
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private BigDecimal amount;
    private LocalDate date;
}
```

### Cross-Cutting Layers

#### Security Layer
**Purpose:** Handle authentication, authorization, and security concerns.

**Components:**
- JWT Filter (`JwtAuthenticationFilter`)
- Security Configuration (`SecurityConfig`)
- UserDetailsService implementation
- Password encoding

**Responsibilities:**
- Authenticate users (JWT, OAuth2)
- Authorize API access
- Encrypt passwords
- Manage security contexts

#### Configuration Layer
**Purpose:** Configure application-wide settings and beans.

**Components:**
- `@Configuration` classes
- CORS configuration (`CorsConfig`)
- WebSocket configuration
- Application properties

**Responsibilities:**
- Define Spring beans
- Configure external integrations
- Set up CORS policies
- Configure connection pools

#### DTO Layer (Data Transfer Objects)
**Purpose:** Transfer data between layers without exposing entities.

**Components:**
- Request DTOs (incoming data)
- Response DTOs (outgoing data)
- Validation annotations (`@NotNull`, `@Email`)

**Responsibilities:**
- Define API request/response structure
- Validate input data
- Prevent over-fetching/under-fetching
- Hide sensitive entity fields

**Example:**
```java
public class TransactionDTO {
    @NotNull
    private BigDecimal amount;
    
    @NotBlank
    private String description;
    
    private Long categoryId;
}
```

### Layer Communication Flow

**Complete Request Flow:**
```
1. Client sends HTTP Request
   ↓
2. Security Filter (JWT validation)
   ↓
3. Controller Layer (endpoint routing, validation)
   ↓
4. Service Layer (business logic)
   ↓
5. Repository Layer (database query)
   ↓
6. Entity Layer (ORM mapping)
   ↓
7. Database (MySQL)
   ↓
[Response flows back through the same layers]
   ↓
8. Client receives HTTP Response
```

### Layer Dependencies

**Dependency Direction (Top to Bottom):**
```
Controller Layer
    ↓ depends on
Service Layer
    ↓ depends on
Repository Layer
    ↓ depends on
Entity Layer
```

**Key Principles:**
- **Controllers** never directly access Repositories
- **Services** contain all business logic
- **Repositories** only handle data access
- **Entities** are plain data models with no logic
- Each layer is loosely coupled and independently testable

### Benefits of Layered Architecture

1. **Separation of Concerns:** Each layer has a single, well-defined responsibility
2. **Maintainability:** Changes in one layer don't affect others
3. **Testability:** Each layer can be tested independently (unit tests, integration tests)
4. **Scalability:** Easy to scale individual layers or add new features
5. **Reusability:** Services can be reused by multiple controllers
6. **Security:** Centralized security handling in dedicated layer

## 4. Database Configuration

### 4.1 Database Information
- **Type:** MySQL 8.2
- **Database Name:** `ibudget_db` (local development and VPS production)
- **Default Connection:** `localhost:3306` (configurable via environment variables)
- **Database User:** `ibudget_user` (configurable via `DB_USERNAME`)
- **Connection Pool:** Hikari (optimized for VPS deployment)

### 4.2 Hikari Connection Pool Settings
- Maximum pool size: 10 connections
- Minimum idle: 2 connections
- Connection timeout: 20 seconds
- Idle timeout: 600 seconds (10 minutes)
- Max lifetime: 1800 seconds (30 minutes)
- Test query: `SELECT 1`

### 4.3 JPA/Hibernate Settings
- **DDL Auto:** `update` (automatically updates schema)
- **Show SQL:** Configurable via `SHOW_SQL` environment variable (default: false)
- **Open in View:** Disabled (`false`)

## 5. Backend Components

### 5.1 Controllers (11)
REST API endpoints for handling HTTP requests.

| Controller | Purpose | Base Endpoint |
|-----------|---------|---------------|
| `AuthController` | User authentication (login, signup, email verification, password reset) | `/api/auth` |
| `UserController` | User profile management | `/api/users` |
| `TransactionController` | Transaction CRUD operations | `/api/transactions` |
| `ExpenseController` | Expense-specific operations | `/api/expenses` |
| `CategoryController` | Category management | `/api/categories` |
| `BudgetController` | Budget management | `/api/budgets` |
| `SavingController` | Savings goals management | `/api/savings` |
| `SavingTransactionController` | Savings transaction operations | `/api/saving-transactions` |
| `ChatbotController` | AI chatbot integration | `/api/chat` |
| `NotificationController` | Notification management | `/api/notifications` |
| `NotificationWebSocketController` | Real-time notifications via WebSocket | WebSocket endpoint |

### 5.2 Services (10)
Business logic layer between controllers and repositories.

| Service | Responsibility |
|---------|---------------|
| `UserService` | User account operations, authentication logic |
| `TransactionService` | Transaction business logic, calculations |
| `CategoryService` | Category management logic |
| `SavingService` | Savings goals and tracking |
| `ChatbotService` | AI chatbot integration with N8N webhooks |
| `NotificationService` | Notification creation and management |
| `EmailService` | Email sending (verification, password reset) |
| `UserContextService` | User financial data aggregation for AI context |
| `InputValidationService` | Input validation and sanitization |
| `RateLimitService` | Rate limiting for chatbot requests (Bucket4j) |

### 5.3 Repositories (6)
Data access layer using Spring Data JPA.

| Repository | Entity | Purpose |
|-----------|--------|---------|
| `UserRepository` | `User` | User account data access |
| `TransactionRepository` | `Transaction` | Transaction data access |
| `CategoryRepository` | `Category` | Category data access |
| `BudgetRepository` | `Budget` | Budget data access |
| `SavingRepository` | `Saving` | Savings goals data access |
| `NotificationRepository` | `Notification` | Notification data access |

### 5.4 Entities (7)
JPA entities mapped to database tables.

| Entity | Database Table | Description |
|--------|---------------|-------------|
| `User` | `users` | User account information, credentials, profile |
| `Transaction` | `transactions` | Income and expense records |
| `Category` | `categories` | Transaction categories |
| `Budget` | `budgets` | Budget limits and tracking |
| `Saving` | `savings` | Savings goals and progress |
| `Notification` | `notifications` | User notifications |
| `AuthProvider` | N/A | Enum for authentication providers (LOCAL, GOOGLE) |

## 6. Key Features & Integration

### 6.1 Authentication & Authorization
- **JWT Implementation:** Stateless authentication using Bearer tokens
- **OAuth2:** Google Sign-In integration
- **Email Verification:** Account verification via email
- **Password Reset:** Secure password reset flow with email tokens
- **Security Config:** URL protection rules, CORS configuration
- **Rate Limiting:** Chatbot endpoint rate limiting (10 requests/minute by default)

### 6.2 Real-time Services
- **WebSockets:** Real-time notification push to frontend
- **Email Service:** SMTP-based email for verification and alerts

### 6.3 AI Integration
- **N8N Webhook Integration:** Primary and fallback webhooks for chatbot
  - Primary: `https://n8n-j3he.onrender.com/webhook/3359fb07-339e-465f-9a4b-afc19a8e8f0b`
  - Fallback: `https://automate.kaelvxdev.space/webhook/3359fb07-339e-465f-9a4b-afc19a8e8f0b`
  - Failover timeout: 15 seconds
- **User Context Service:** Aggregates financial data for AI model (RAG pattern)
- **Rate Limiting:** Prevents API abuse on chatbot endpoints

## 7. Configuration

### 7.1 Application Properties
Configuration is located in `src/main/resources/application.properties`.

**Key Configuration Areas:**
- **Database Connection:** MySQL connection URL, username, password
- **JWT Secret:** Token signing key
- **Mail Server:** SMTP settings (Gmail by default)
- **OAuth2:** Google Client ID and Secret
- **N8N Webhooks:** Primary and fallback webhook URLs
- **Frontend URLs:** CORS origins, OAuth2 redirect URIs
- **Email Templates:** Verification and password reset links

### 7.2 Environment Variables
Sensitive data is loaded via environment variables (supports `.env` file).

**Required Environment Variables:**
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `MAIL_USERNAME` - SMTP username
- `MAIL_PASSWORD` - SMTP password
- `APP_EMAIL_FROM` - Sender email address
- `GOOGLE_CLIENT_ID` - Google OAuth2 Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 Client Secret

**Optional Environment Variables:**
- `SERVER_PORT` (default: 8081)
- `DB_URL` (default: localhost MySQL)
- `DB_USERNAME` (default: ibudget_user)
- `FRONTEND_URL` (default: http://i-budget.site)
- `CHATBOT_RATE_LIMIT` (default: 10)

## 8. Running the Application

### 8.1 Prerequisites
- JDK 21
- Maven Wrapper (included in project - use `./mvnw` or `.\mvnw`)
- MySQL Server (running and configured)
- Environment variables configured (`.env` file recommended)

### 8.2 Commands
- **Run Locally:**
  ```bash
  ./mvnw spring-boot:run
  ```
  Windows: `.\mvnw spring-boot:run`

- **Run Tests:**
  ```bash
  ./mvnw test
  ```

- **Clean and Install:**
  ```bash
  ./mvnw clean install
  ```

- **Package:**
  ```bash
  ./mvnw package
  ```

### 8.3 Application Endpoints
- **API Base URL:** `http://localhost:8081/api`
- **Health Check:** `http://localhost:8081/actuator/health` (if actuator is enabled)

## 9. API Overview

For detailed API documentation, refer to `API_DOCUMENTATION.md` or Swagger/OpenAPI specs.

**Main API Endpoints:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `GET /api/users/me` - Get current user profile
- `GET/POST /api/transactions` - Transaction CRUD
- `GET/POST /api/categories` - Category management
- `GET/POST /api/budgets` - Budget management
- `GET/POST /api/savings` - Savings goals
- `POST /api/chat` - AI chatbot interaction
- `GET /api/notifications` - Get user notifications
