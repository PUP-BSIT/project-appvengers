# Copilot Instructions for iBudget Project

**Last Updated**: November 4, 2025
**Document Version**: 3.0

when conducting a code review, ensure that the code follows best practices and adheres to the project's coding standards. Additionally, review the code for any potential security vulnerabilities and ensure that it is properly documented. When reviewing code, consider the following:

- Code readability and maintainability
- Code organization and structure
- Code performance and efficiency
- Code security and privacy
- Code documentation and comments

When performing a code review, respond in English.

## Repository Overview

**iBudget** is a full-stack web application for personal finance management, helping users (especially students) track expenses, set budgets, and visualize spending habits.

### Technology Stack
- **Frontend**: Angular 20.3.0 with TypeScript 5.9.2, Bootstrap 5.3.8, Chart.js for visualizations
- **Backend**: Spring Boot 3.5.7 with Java 21, Maven 3.9.11
- **Database**: MySQL (hosted on Hostinger, remote database - no local DB required)
- **Runtime Requirements**: Node.js 24.8.0, Java 21.0.7, Maven 3.9.11

### Repository Structure
```
project-appvengers/
├── frontend/
│   └── ibudget/           # Angular application
│       ├── src/           # Source code
│       │   ├── app/       # Angular components and modules
│       │   ├── services/  # Angular services
│       │   ├── assets/    # Images, icons, etc.
│       │   └── styles/    # Global SCSS styles
│       ├── public/        # Static assets
│       ├── package.json   # Frontend dependencies
│       ├── angular.json   # Angular configuration
│       └── tsconfig*.json # TypeScript configs
├── backend/
│   └── appvengers/        # Spring Boot application
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/backend/appvengers/
│       │   │   │   ├── controller/     # REST API endpoints
│       │   │   │   ├── service/        # Business logic
│       │   │   │   ├── repository/     # JPA repositories
│       │   │   │   ├── entity/         # JPA entities
│       │   │   │   ├── dto/            # Data Transfer Objects
│       │   │   │   └── config/         # Configuration (CORS, Security)
│       │   │   └── resources/
│       │   │       └── application.properties  # Database config
│       │   └── test/      # Test files
│       ├── pom.xml        # Maven configuration
│       └── mvnw           # Maven wrapper (USE THIS, NOT mvn)
├── documents/             # Project documentation
└── README.md
```

## Build and Run Instructions

### Frontend (Angular)

**Location**: `frontend/ibudget/`

**Setup and Build Commands** (ALWAYS run in this order):
1. **Install dependencies** (ALWAYS run this first before any other npm command):
   ```bash
   cd frontend/ibudget
   npm install
   ```

2. **Start development server** (runs on http://localhost:4200):
   ```bash
   npm start
   ```
   - This runs `ng serve` internally
   - Development server with hot reload enabled
   - No need to start backend first - can run independently
   - CORS is configured to allow connections to backend at localhost:8081

3. **Build for production**:
   ```bash
   npm run build
   ```
   - Builds to `dist/` directory with production optimizations
   - Budget limits: 500kB warning, 1MB error for initial bundle

4. **Run tests**:
   ```bash
   npm test
   ```
   - Runs Jasmine/Karma tests
   - Launches Chrome for test execution

5. **Watch mode** (for development):
   ```bash
   npm run watch
   ```
   - Continuous build with development configuration

### Backend (Spring Boot)

**Location**: `backend/appvengers/`

**Setup and Build Commands** (ALWAYS run in this order):
1. **Clean and install** (ALWAYS run this first before running the application):
   ```bash
   cd backend/appvengers
   ./mvnw clean install
   ```
   - On Windows: `.\mvnw clean install`
   - Downloads dependencies and compiles the project
   - Creates JAR file in `target/` directory

2. **Run the application** (runs on http://localhost:8081):
   ```bash
   ./mvnw spring-boot:run
   ```
   - On Windows: `.\mvnw spring-boot:run`
   - Connects to remote MySQL database automatically
   - No local database setup required
   - CORS configured to accept requests from http://localhost:4200

3. **Run tests**:
   ```bash
   ./mvnw test
   ```
   - Runs all unit and integration tests

**CRITICAL**: This project uses Maven Wrapper EXCLUSIVELY. System Maven (`mvn`) is NOT available or used.
- On Linux/Mac: Use `./mvnw`
- On Windows: Use `.\mvnw`
- NEVER use `mvn` command - it will fail

## API Endpoints

### Base URL
- **Development**: `http://localhost:8081/api`
- **API Prefix**: All endpoints start with `/api/`

### Current Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/signup` - User registration
  - Request body: `SignupRequest` (validated with `@Valid`)
  - Returns: `ApiResponse` with user details or validation errors

#### Future Endpoints (To Be Implemented)
- `/api/transactions` - Transaction management (GET, POST, PUT, DELETE)
- `/api/categories` - Category management
- `/api/budgets` - Budget management
- `/api/goals` - Financial goals
- `/api/notifications` - User notifications
- `/api/users` - User profile management

### CORS Configuration
- **Frontend Origin**: `http://localhost:4200` (configured in `AppConfig.java`)
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: All (`*`)
- **Credentials**: Enabled (`allowCredentials: true`)

**Note**: When deploying to production, update CORS origins in `AppConfig.java` to match production frontend URL.

## Database Configuration

**Database**: Remote MySQL hosted on Hostinger
- **Host**: 148.222.53.30:3306
- **Database Name**: u404564433_1budg3t
- **Connection**: Automatically configured via `application.properties`
- **No local database required**: The application connects directly to the remote database
- **Configuration file**: `backend/appvengers/src/main/resources/application.properties`
- **Connection pooling**: Hikari with optimized settings:
  - Max pool size: 5 connections
  - Connection timeout: 20 seconds
  - Validation timeout: 3 seconds
  - Test query: `SELECT 1`

**CRITICAL**: Do NOT modify database credentials in `application.properties` unless explicitly instructed. The database is shared and hosted remotely.

### Database Connection Details
```properties
spring.datasource.url=jdbc:mysql://148.222.53.30:3306/u404564433_1budg3t?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&autoReconnect=true
spring.datasource.username=[REDACTED - see application.properties]
spring.datasource.password=[REDACTED - see application.properties]
```

## Key Configuration Files

### Frontend Configuration
- **angular.json**: Angular CLI configuration, build settings, asset management
  - Styles: Bootstrap CSS and icons preloaded globally
  - Style preprocessor: SCSS with `src/styles` as include path
  - Assets: `public/` and `src/assets/` directories

- **package.json**: NPM dependencies and scripts
  - Prettier configuration included for code formatting
  - Key dependencies: Angular 20, Bootstrap 5, Chart.js, ng2-charts
  - Scripts: `start`, `build`, `test`, `watch`

- **tsconfig.json**: TypeScript compiler configuration
  - Target: ES2022
  - Strict mode enabled

### Backend Configuration
- **pom.xml**: Maven dependencies and build configuration
  - Spring Boot 3.5.7 parent
  - Dependencies: Web, JPA, MySQL, Security, Validation, Lombok
  - Java 21 target

- **application.properties**: Database connection and JPA settings
  - Server runs on port 8081
  - Hibernate DDL auto-update enabled
  - Show SQL enabled for development
  - Hikari connection pool configured for remote database stability

## Architecture and Code Organization

### Frontend Architecture (Angular)
- **Component-based**: Uses Angular components with SCSS styling
- **Routing**: Angular Router for navigation
- **Forms**: Reactive and template-driven forms
- **Services**: Injectable services for API communication and business logic
- **Styling**: Bootstrap 5 + custom SCSS, Bootstrap Icons for iconography
- **Visualization**: Chart.js via ng2-charts wrapper

**Key Features to Implement**:
- Transaction management (add, edit, delete)
- Category management
- Budget and goal setting
- Notifications system
- Financial charts and graphs (using Chart.js)
- User account management

**Service Communication Pattern**:
- Services should inject `HttpClient` to communicate with backend
- API base URL: `http://localhost:8081/api`
- Use Angular's `HttpClientModule` for HTTP requests
- Handle responses with RxJS Observables

### Backend Architecture (Spring Boot)
- **Layered Architecture**: Controller → Service → Repository
- **Security**: Spring Security enabled (configured in `SecurityConfig.java`)
- **Validation**: Bean Validation with annotations (`@Valid`, `@NotNull`, etc.)
- **ORM**: JPA/Hibernate with MySQL
- **Utilities**: Lombok for reducing boilerplate

**Standard Package Structure** (under `src/main/java/com/backend/appvengers/`):
- `controller/` - REST API endpoints
  - Use `@RestController`, `@RequestMapping`, `@CrossOrigin`
  - Example: `AuthController.java` with `/api/auth` mapping
- `service/` - Business logic
  - Use `@Service` annotation
  - Injected into controllers via constructor injection
- `repository/` - Data access layer (JPA repositories)
  - Extend `JpaRepository<Entity, ID>`
- `entity/` - JPA entities
  - Use `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
  - Use Lombok annotations: `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`
  - Example: `User.java`
- `dto/` - Data Transfer Objects
  - Use for request/response payloads
  - Add validation annotations (`@NotBlank`, `@Email`, etc.)
  - Example: `SignupRequest.java`, `ApiResponse.java`
- `config/` - Configuration classes
  - `SecurityConfig.java` - Spring Security configuration
  - `AppConfig.java` - CORS and other app configurations

**REST Controller Pattern**:
```java
@RestController
@RequestMapping("/api/resource")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ResourceController {
    private final ResourceService service;

    @GetMapping
    public ResponseEntity<List<Resource>> getAll() { ... }

    @PostMapping
    public ResponseEntity<ApiResponse> create(@Valid @RequestBody ResourceDto dto) { ... }
}
```

## Environment Variables

Currently, all configuration is in `application.properties`. No additional environment variables are required for local development.

**For Production Deployment** (when needed):
- `DATABASE_URL` - Override database connection string
- `DATABASE_USERNAME` - Override database username
- `DATABASE_PASSWORD` - Override database password
- `CORS_ALLOWED_ORIGINS` - Frontend URL for CORS configuration
- `SERVER_PORT` - Backend port (default: 8081)

## Validation and Testing

### Frontend Testing
- **Test Framework**: Jasmine with Karma
- **Command**: `npm test` (from `frontend/ibudget/`)
- **Test Files**: `*.spec.ts` files alongside components
- **Coverage**: Run `ng test --code-coverage` for coverage reports

### Backend Testing
- **Test Framework**: JUnit with Spring Boot Test
- **Command**: `./mvnw test` (from `backend/appvengers/`)
- **Test Files**: Located in `src/test/java/`
- **Test Annotations**: `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest`

### Manual Testing
1. **Frontend**: Navigate to http://localhost:4200 after running `npm start`
2. **Backend**: Test API endpoints at http://localhost:8081/api after running `./mvnw spring-boot:run`
3. **Integration**: Ensure frontend can communicate with backend APIs
4. **Tools**: Use Postman or curl to test API endpoints directly

## Troubleshooting

### Common Issues and Solutions

#### Port Conflicts
**Problem**: `Port 4200 is already in use` or `Port 8081 is already in use`

**Solutions**:
- **Frontend**: Kill process on port 4200
  - Windows: `netstat -ano | findstr :4200` then `taskkill /PID <PID> /F`
  - Linux/Mac: `lsof -ti:4200 | xargs kill -9`
- **Backend**: Kill process on port 8081
  - Windows: `netstat -ano | findstr :8081` then `taskkill /PID <PID> /F`
  - Linux/Mac: `lsof -ti:8081 | xargs kill -9`

#### Node/Java Version Mismatch
**Problem**: Build fails due to incompatible Node.js or Java version

**Solutions**:
- Verify Node.js version: `node --version` (should be 24.8.0 or compatible)
- Verify Java version: `java -version` (should be 21.0.7 or Java 21)
- Use NVM (Node Version Manager) to switch Node versions
- Use SDKMAN or update JDK installation for Java

#### Maven Wrapper Not Executable
**Problem**: `./mvnw: Permission denied` on Linux/Mac

**Solution**:
```bash
chmod +x mvnw
./mvnw clean install
```

#### Database Connection Issues
**Problem**: `Communications link failure` or connection timeout

**Possible Causes**:
- Remote database server is down (check with team)
- Network firewall blocking port 3306
- Hikari connection pool exhausted

**Solutions**:
1. Verify database server is accessible: `telnet 148.222.53.30 3306`
2. Check application.properties for correct credentials
3. Restart backend application to reset connection pool
4. Check Hikari pool settings in application.properties

#### CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions**:
- Verify backend is running on port 8081
- Check `AppConfig.java` has correct frontend origin (`http://localhost:4200`)
- Ensure `@CrossOrigin` annotation is present on controllers
- Clear browser cache and retry

#### Frontend Build Errors
**Problem**: `npm install` fails or `npm start` errors

**Solutions**:
1. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear npm cache: `npm cache clean --force`
3. Check Node.js version compatibility

#### Backend Build Errors
**Problem**: `./mvnw clean install` fails

**Solutions**:
1. Clean Maven cache: `./mvnw dependency:purge-local-repository`
2. Verify Java version: `java -version`
3. Check for compilation errors in Java files
4. Ensure `pom.xml` is not corrupted

## Deployment Notes

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Output directory: `dist/ibudget/browser/`
3. Deploy to static hosting (Netlify, Vercel, AWS S3, etc.)
4. **Important**: Update API base URL in Angular services to production backend URL
5. Configure production CORS origin in backend

### Backend Deployment
1. Build JAR file: `./mvnw clean package`
2. JAR location: `target/appvengers-<version>.jar`
3. Run JAR: `java -jar target/appvengers-<version>.jar`
4. **Important**: Update `application.properties` or use environment variables for production database
5. Configure production CORS origins in `AppConfig.java`

### Production Checklist
- [ ] Update database credentials for production
- [ ] Configure CORS for production frontend URL
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` (not `update`) in production
- [ ] Disable `spring.jpa.show-sql` in production
- [ ] Enable HTTPS/SSL
- [ ] Configure proper logging levels
- [ ] Set up monitoring and error tracking

## Important Notes for Coding Agents

### ALWAYS Do This:
1. **Frontend changes**: Run `npm install` in `frontend/ibudget/` before starting development
2. **Backend changes**: Run `./mvnw clean install` in `backend/appvengers/` before running
3. **Use Maven Wrapper**: ALWAYS use `./mvnw` (or `.\mvnw` on Windows), NEVER `mvn`
4. **Check paths**: ALWAYS navigate to the correct subdirectory (`frontend/ibudget/` or `backend/appvengers/`) before running commands
5. **Database**: Connect to remote database only - do NOT attempt to set up local MySQL
6. **CORS**: Verify CORS configuration when adding new API endpoints
7. **Validation**: Use `@Valid` annotation on request bodies and include proper error handling
8. **Testing**: Run tests after making changes to ensure nothing breaks

### NEVER Do This:
- **NEVER use `mvn` command** - System Maven is not installed. ALWAYS use `./mvnw` or `.\mvnw` wrapper instead
- Do NOT modify database credentials in `application.properties` without explicit instruction
- Do NOT attempt to set up a local database - the app uses a remote database
- Do NOT run npm/mvn commands from the repository root - always change to the correct subdirectory first
- Do NOT change CORS origins without verifying both frontend and backend configurations
- Do NOT commit sensitive data (passwords, API keys) to version control
- Do NOT disable Spring Security without understanding the implications

### Common Patterns

#### Adding New Angular Component
```bash
cd frontend/ibudget
ng generate component components/component-name
# or shorthand
ng g c components/component-name
```

#### Adding New Angular Service
```bash
cd frontend/ibudget
ng generate service services/service-name
# or shorthand
ng g s services/service-name
```

#### Adding New REST Endpoint
1. Create DTO classes in `dto/` package
2. Create or update entity in `entity/` package
3. Create or update repository in `repository/` package
4. Create or update service in `service/` package
5. Create or update controller in `controller/` package
6. Add `@CrossOrigin(origins = "http://localhost:4200")` to controller
7. Use `@Valid` for request validation

#### Adding New JPA Entity
```java
@Entity
@Table(name = "table_name")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntityName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String field;

    // Relationships, timestamps, etc.
}
```

#### Creating Repository Interface
```java
@Repository
public interface EntityNameRepository extends JpaRepository<EntityName, Long> {
    // Custom query methods
    Optional<EntityName> findByField(String field);
}
```

### Code Style Guidelines

#### Frontend (Angular/TypeScript)
- Follow Angular style guide (https://angular.io/guide/styleguide)
- Use Prettier configuration in package.json:
  - Single quotes preferred
  - 100 character line width
  - 2 space indentation
- Component naming: `feature-name.component.ts`
- Service naming: `feature-name.service.ts`
- Use async pipe in templates when possible
- Unsubscribe from observables in `ngOnDestroy()`

#### Backend (Java/Spring Boot)
- Follow Java conventions and Spring best practices
- Use Lombok to reduce boilerplate:
  - `@Data` for entities and DTOs
  - `@RequiredArgsConstructor` for constructor injection
  - `@Slf4j` for logging
- Use meaningful variable and method names
- Keep controllers thin - business logic in services
- Use `@Transactional` on service methods that modify data
- Handle exceptions properly with `@ControllerAdvice` or try-catch
- Follow REST naming conventions:
  - Collections: `/api/resources` (plural)
  - Single resource: `/api/resources/{id}`
  - Use appropriate HTTP methods (GET, POST, PUT, DELETE)

### Lombok Usage Examples
```java
// Entity
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User { ... }

// Controller/Service with constructor injection
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
}

// Logging
@Slf4j
@Service
public class UserService {
    public void someMethod() {
        log.info("Logging message");
    }
}
```

## Trust These Instructions

These instructions have been validated against the actual codebase and build process. The document includes:
- ✅ Actual package structure from backend
- ✅ Real API endpoint patterns
- ✅ Verified CORS configuration
- ✅ Confirmed database connection settings
- ✅ Tested build and run commands

ONLY perform additional searches or exploration if:
- The information here is incomplete for your specific task
- You encounter an error that contradicts these instructions
- You need to understand implementation details not covered here
- You need to see existing code patterns for reference

When in doubt, follow these instructions first before exploring the codebase. These instructions are comprehensive and up-to-date as of November 2025.

---

**Quick Reference Commands**

```bash
# Frontend (from frontend/ibudget/)
npm install              # Install dependencies (ALWAYS first)
npm start                # Run dev server (localhost:4200)
npm run build            # Production build
npm test                 # Run tests

# Backend (from backend/appvengers/)
.\mvnw clean install     # Build project (ALWAYS first) [Windows]
./mvnw clean install     # Build project (ALWAYS first) [Linux/Mac]
.\mvnw spring-boot:run   # Run application (localhost:8081) [Windows]
./mvnw spring-boot:run   # Run application (localhost:8081) [Linux/Mac]
.\mvnw test              # Run tests [Windows]
./mvnw test              # Run tests [Linux/Mac]
```
