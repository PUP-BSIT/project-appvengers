# Environment Variables Setup Guide

## Quick Setup

1. **Copy the template file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file with your actual values:**
   - Generate a secure JWT secret: `openssl rand -hex 32` (Linux/Mac) or use PowerShell
   - Update database credentials for your environment
   - Set appropriate server port

3. **Load environment variables:**
   - **Development:** Spring Boot will automatically load from .env file if you have spring-boot-starter-actuator
   - **Production:** Set environment variables in your deployment platform

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | `your_secure_32_char_secret` |
| `DB_URL` | Database connection URL | `jdbc:mysql://localhost:3306/mydb` |
| `DB_USERNAME` | Database username | `myuser` |
| `DB_PASSWORD` | Database password | `mypassword` |
| `SERVER_PORT` | Server port (optional) | `8081` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `dev` |

## Security Notes

- **Never commit .env files** to version control
- **Use different secrets** for development and production
- **Rotate JWT secrets** periodically
- **Use strong, random secrets** (minimum 32 characters)

## Production Deployment

Set these as environment variables in your hosting platform:
- **AWS:** Use EC2 user data or Parameter Store
- **Heroku:** Use Config Vars
- **Docker:** Use `-e` flags or env files
- **Kubernetes:** Use Secrets or ConfigMaps

## Testing the Setup

1. Start the application: `./mvnw spring-boot:run`
2. Check logs for any missing environment variable errors
3. Test authentication endpoints to verify JWT functionality