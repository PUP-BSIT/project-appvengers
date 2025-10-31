# 🚀 Quick Start Guide

## Backend is READY! ✅

### What Was Built:

1. ✅ **User Entity** - Database model with validation
2. ✅ **User Repository** - Database access layer
3. ✅ **User Service** - Business logic + BCrypt password encryption
4. ✅ **Auth Controller** - REST API endpoints
5. ✅ **Security Config** - CORS + Password encryption
6. ✅ **Database Table** - Auto-created `users` table in MySQL

---

## 🏃 Start the Backend (Already Running!)

The server is already running on **port 8081** if you see this message.

If not running, start it with:
```bash
./mvnw spring-boot:run
```

---

## 🧪 Test the API

### Test 1: Register a User
```powershell
$body = @{
    username = "johndoe"
    email = "john@example.com"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/api/auth/signup" `
  -Method Post -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully! Please verify your email.",
  "data": {
    "userId": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Test 2: Check if Username Exists
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/auth/check-username/johndoe"
```

### Test 3: Check if Email Exists
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/auth/check-email/john@example.com"
```

---

## 📱 Connect Angular Frontend

### Step 1: Create Auth Service
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) {}

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }
}
```

### Step 2: Update Sign-up Component
```typescript
onSubmit() {
  if (this.signUpForm.valid) {
    this.authService.signup(this.signUpForm.value).subscribe({
      next: (response) => {
        console.log('Success:', response);
        alert(response.message);
        // Redirect to login or dashboard
      },
      error: (error) => {
        console.error('Error:', error);
        alert(error.error.message || 'Registration failed');
      }
    });
  }
}
```

### Step 3: Import HttpClientModule
```typescript
// app.module.ts
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule, ...],
  ...
})
export class AppModule { }
```

---

## 📚 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/check-username/{username}` | GET | Check username availability |
| `/api/auth/check-email/{email}` | GET | Check email availability |
| `/api/auth/verify-email?token={token}` | GET | Verify email (future) |

---

## 📖 Full Documentation

- **`API_DOCUMENTATION.md`** - Complete API reference
- **`INTEGRATION_GUIDE.md`** - Detailed Angular integration steps
- **`BACKEND_SUMMARY.md`** - Complete implementation summary

---

## 🎯 Next Steps

1. **Test the backend** using the PowerShell commands above
2. **Create Angular Auth Service** (see Step 1 above)
3. **Update Sign-up Component** to call the API (see Step 2 above)
4. **Test end-to-end** from Angular frontend to backend
5. **Check MySQL database** to verify user is saved

---

## ⚙️ Configuration

### Backend URL
```
http://localhost:8081
```

### Frontend URL (Angular)
```
http://localhost:4200
```

### Database
- **Host:** 148.222.53.30:3306
- **Database:** u404564433_1budg3t
- **Table:** users (auto-created)

---

## 🐛 Troubleshooting

### CORS Error?
- Ensure backend is running on port 8081
- Frontend must be on http://localhost:4200
- Check browser console for specific error

### Connection Error?
- Is backend running? Check console for Spring Boot startup
- Is MySQL accessible? Check application.properties
- Is port 8081 free? Use `netstat -an | findstr 8081`

### Validation Error?
- Username: 3-50 characters, must be unique
- Email: Valid email format, must be unique  
- Password: Minimum 6 characters
- Passwords must match

---

## ✅ Status

**Backend:** ✅ Running on port 8081  
**Database:** ✅ Connected to Hostinger MySQL  
**Users Table:** ✅ Created  
**API Endpoints:** ✅ Working  
**CORS:** ✅ Configured for Angular  
**Password Encryption:** ✅ BCrypt enabled  

---

## 🎉 You're Ready!

The backend is fully functional and ready to receive requests from your Angular sign-up component!

**Happy Coding! 🚀**
