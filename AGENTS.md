# AGENTS.md - Development Guidelines for Project Appvengers

## Build/Lint/Test Commands

### Frontend (Angular - from frontend/ibudget/)
```bash
npm install                    # Install dependencies (ALWAYS first)
npm start                       # Run dev server (localhost:4200)
npm run build                  # Production build
npm test                       # Run tests
npm run test:unit              # Run single test file
npm run lint                   # Run linting
```

### Backend (Spring Boot - from backend/appvengers/)
```bash
./mvnw clean install            # Build project (ALWAYS first) [Linux/Mac]
.\mvnw clean install            # Build project (ALWAYS first) [Windows]
./mvnw spring-boot:run          # Run application (localhost:8081)
./mvnw test                    # Run all tests
./mvnw test -Dtest=TestName    # Run single test class
```

## Code Style Guidelines

### Java/Spring Boot Backend
- **Imports**: Group standard imports first, then third-party, then static
- **Formatting**: 2-space indentation, 120-char line limit
- **Naming**: camelCase for variables, PascalCase for classes, UPPER_SNAKE_CASE for constants
- **Annotations**: Use Lombok (@Data, @RequiredArgsConstructor, @Slf4j)
- **Error Handling**: Use @ControllerAdvice, return ResponseEntity with HttpStatus
- **Security**: NEVER commit secrets, use environment variables
- **Validation**: Use @Valid on request bodies, @NotBlank/@Email on DTO fields

### TypeScript/Angular Frontend  
- **Imports**: Angular libs first, then third-party, then relative imports
- **Formatting**: 2-space indentation, 100-char line limit (Prettier config)
- **Naming**: camelCase for variables, PascalCase for classes/components
- **Components**: Use signals, implement OnDestroy, unsubscribe with takeUntil
- **Services**: Injectable, return Observables, handle errors with catchError
- **Forms**: Use FormBuilder, ReactiveFormsModule, proper validation

### Database/JPA
- **Entities**: Use @Entity, @Table, Lombok @Data/@NoArgsConstructor/@AllArgsConstructor
- **Repositories**: Extend JpaRepository<Entity, ID>, custom queries with Optional return
- **DTOs**: Validation annotations, @NotBlank/@Email/@Size constraints

### Security & Environment
- **NEVER** commit .env files, API keys, or credentials
- **ALWAYS** use environment variables for secrets
- **CORS**: Configure for http://localhost:4200 in development
- **JWT**: Use BCrypt, proper secret management

### Testing
- **Backend**: @SpringBootTest, @DataJpaTest, @WebMvcTest annotations
- **Frontend**: *.spec.ts files, describe/it pattern, async/await testing
- **Coverage**: Run tests after changes, ensure no regressions

### Critical Rules
- **ALWAYS** use Maven Wrapper (./mvnw or .\mvnw), NEVER system mvn
- **ALWAYS** navigate to correct subdirectory before running commands
- **NEVER** disable Spring Security without understanding implications
- **ALWAYS** validate request bodies with @Valid
- **NEVER** commit sensitive data to version control