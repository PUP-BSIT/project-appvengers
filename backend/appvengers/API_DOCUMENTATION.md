# Backend API Documentation

## Base URL
```
http://localhost:8081/api
```

## Authentication Endpoints

### 1. User Signup
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully! Please verify your email.",
  "data": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Username is already taken!"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "username": "Username must be between 3 and 50 characters",
    "email": "Email should be valid",
    "password": "Password must be at least 6 characters"
  }
}
```

---

### 2. Check Username Availability
**Endpoint:** `GET /api/auth/check-username/{username}`

**Success Response:**
```json
{
  "success": true,
  "message": "",
  "data": {
    "exists": true
  }
}
```

---

### 3. Check Email Availability
**Endpoint:** `GET /api/auth/check-email/{email}`

**Success Response:**
```json
{
  "success": true,
  "message": "",
  "data": {
    "exists": false
  }
}
```

---

### 4. Verify Email
**Endpoint:** `GET /api/auth/verify-email?token={verificationToken}`

**Success Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid verification token"
}
```

---

## User Entity Structure

```java
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "password": "[encrypted]",
  "isActive": true,
  "emailVerified": false,
  "verificationToken": "uuid-token",
  "createdAt": "2025-10-31T08:30:00",
  "updatedAt": "2025-10-31T08:30:00"
}
```

---

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:4200` (Angular frontend)

Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## Security Features

1. **Password Encryption:** BCrypt with Spring Security
2. **Email Verification:** Token-based system
3. **CORS Protection:** Configured for frontend origin
4. **Input Validation:** Jakarta Bean Validation
5. **Unique Constraints:** Username and email must be unique

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_active BIT,
  email_verified BIT,
  verification_token VARCHAR(255),
  created_at DATETIME(6),
  updated_at DATETIME(6)
);
```

---

## Testing with cURL

### Signup:
```bash
curl -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Check Username:
```bash
curl http://localhost:8081/api/auth/check-username/testuser
```

### Check Email:
```bash
curl http://localhost:8081/api/auth/check-email/test@example.com
```
