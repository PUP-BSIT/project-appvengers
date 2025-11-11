# iBudget Environment Setup Guide

This guide explains how to configure environment variables for the iBudget application (both backend and frontend).

## 🔒 Why Environment Variables?

Environment variables allow us to:
- **Secure sensitive data** - Keep credentials out of version control
- **Support multiple environments** - Different configs for dev/staging/production
- **Easy secret rotation** - Update credentials without changing code
- **Team collaboration** - New developers can set up quickly with `.env.example`

---

## 🛠️ Backend Setup (Spring Boot)

### 1. Navigate to Backend Directory
```bash
cd backend/appvengers
```

### 2. Create `.env` File
Copy the example file and fill in your actual values:

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 3. Configure Your `.env` File
Open `.env` and update with actual values:

```env
# Database Configuration
DB_URL=jdbc:mysql://148.222.53.30:3306/u404564433_1budg3t?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&autoReconnect=true
DB_USERNAME=u404564433_appv3ng3rz
DB_PASSWORD=your_actual_database_password

# JWT Configuration (IMPORTANT: Use a strong secret!)
JWT_SECRET=your_jwt_secret_key_min_32_chars_recommended_longer

# Server Configuration
SERVER_PORT=8081
```

### 4. Load Environment Variables

#### Option A: System Environment Variables (Recommended for Production)
Set system environment variables before running the application.

**Windows (PowerShell):**
```powershell
$env:DB_URL="jdbc:mysql://..."
$env:DB_USERNAME="username"
$env:DB_PASSWORD="password"
$env:JWT_SECRET="your_secret"
$env:SERVER_PORT="8081"
```

**Mac/Linux (Bash):**
```bash
export DB_URL="jdbc:mysql://..."
export DB_USERNAME="username"
export DB_PASSWORD="password"
export JWT_SECRET="your_secret"
export SERVER_PORT="8081"
```

#### Option B: Using dotenv-java Library (For Local Development)

1. Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.0.0</version>
</dependency>
```

2. Create a configuration class to load `.env`:
```java
@Configuration
public class DotenvConfig {
    @PostConstruct
    public void loadEnv() {
        Dotenv dotenv = Dotenv.configure()
            .directory("./")
            .ignoreIfMissing()
            .load();
        
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );
    }
}
```

#### Option C: IntelliJ IDEA Environment Variables
1. Edit Run Configuration
2. Add environment variables in "Environment variables" field
3. Format: `DB_URL=value;DB_USERNAME=value;DB_PASSWORD=value;JWT_SECRET=value`

### 5. Run the Backend
```bash
# Windows
.\mvnw spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```

---

## 🎨 Frontend Setup (Angular)

### 1. Navigate to Frontend Directory
```bash
cd frontend/ibudget
```

### 2. Understand Environment Files
The frontend uses Angular's environment configuration:

- **`src/environments/environment.ts`** - Development (localhost)
- **`src/environments/environment.production.ts`** - Production (i-budget.site)

### 3. Modify Environment Files (If Needed)

**Development** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api'
};
```

**Production** (`environment.production.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://i-budget.site/api'
};
```

### 4. Using Environment Variables in Services

Import and use environment configuration:
```typescript
import { environment } from '../environments/environment';

export class MyService {
  private apiUrl = `${environment.apiUrl}/endpoint`;
}
```

### 5. Run the Frontend

**Development Mode:**
```bash
npm start
# Uses environment.ts (localhost API)
```

**Production Build:**
```bash
npm run build
# Uses environment.production.ts (production API)
# File replacement happens automatically via angular.json
```

---

## 🔐 Security Best Practices

### ✅ DO:
- **Keep `.env` files local** - Never commit to Git
- **Use `.env.example`** - Provide templates with placeholder values
- **Rotate secrets regularly** - Update JWT secrets and passwords periodically (especially if exposed)
- **Use cryptographically strong secrets** - Minimum 32 bytes, recommended 64+ bytes for JWT
- **Generate secrets with crypto libraries** - Use OpenSSL/PowerShell/crypto.randomBytes() (NOT keyboard mashing!)
- **Set proper permissions** - Restrict `.env` file access (chmod 600 on Linux/Mac)
- **Use different secrets per environment** - Separate secrets for dev/staging/production

### ❌ DON'T:
- **Never commit `.env`** - Already excluded in `.gitignore`
- **Don't share secrets** - Use secure channels (password managers, encrypted messages)
- **Don't use default values** - Change all placeholder values in `.env`
- **Don't hardcode credentials** - Always use environment variables

---

## 🧪 Verification

### Backend Verification
1. Start the backend server
2. Check console output - should NOT see credential errors
3. Test API endpoint: `http://localhost:8081/api/auth/check-username/test`

### Frontend Verification
1. Start the frontend dev server
2. Open browser console
3. Check Network tab - API calls should go to correct URL
4. Development: `http://localhost:8081/api`
5. Production build: `https://i-budget.site/api`

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "Could not resolve placeholder 'DB_PASSWORD'"**
- Ensure `.env` file exists in `backend/appvengers/`
- Verify environment variables are loaded
- Check variable names match exactly (case-sensitive)

**Error: "Access denied for user"**
- Verify `DB_USERNAME` and `DB_PASSWORD` are correct
- Check database server is accessible

### Frontend Issues

**Error: "Cannot find module '../environments/environment'"**
- Ensure `src/environments/` directory exists
- Verify both `environment.ts` and `environment.production.ts` are present

**API calls failing (404/CORS)**
- Check `environment.apiUrl` matches backend URL
- Verify backend server is running
- Check CORS configuration in backend

---

## 📚 Additional Resources

- [Spring Boot External Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Angular Environment Configuration](https://angular.dev/tools/cli/environments)
- [Dotenv Java Documentation](https://github.com/cdimascio/dotenv-java)

---

## 🆘 Getting Help

If you encounter issues:
1. Check this guide thoroughly
2. Verify all file paths and variable names
3. Review console error messages
4. Ask the team for assistance

**Remember: NEVER share your actual `.env` file or credentials in public channels!**
