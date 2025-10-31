# Angular Frontend Integration Guide

## Overview
This guide explains how to integrate the Angular signup component with the Spring Boot backend.

---

## Backend Setup Complete ✅

### What's Been Created:

1. **Entity Layer**
   - `User.java` - JPA entity with validation

2. **Repository Layer**
   - `UserRepository.java` - Spring Data JPA repository

3. **Service Layer**
   - `UserService.java` - Business logic and password encryption

4. **Controller Layer**
   - `AuthController.java` - REST API endpoints

5. **Configuration**
   - `SecurityConfig.java` - BCrypt password encoder & CORS
   - `AppConfig.java` - Additional CORS configuration

6. **DTOs**
   - `SignupRequest.java` - Request payload
   - `ApiResponse.java` - Standardized response format

---

## Angular Service Integration

### Step 1: Create Auth Service (if not exists)

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) { }

  signup(userData: SignupRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/signup`, userData);
  }

  checkUsername(username: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/check-username/${username}`);
  }

  checkEmail(email: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/check-email/${email}`);
  }

  verifyEmail(token: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/verify-email?token=${token}`);
  }
}
```

---

### Step 2: Update Sign-up Component

```typescript
// sign-up.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void { }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.signup(this.signUpForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message;
          // Optionally redirect after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'An error occurred during registration';
        }
      }
    });
  }

  // Optional: Real-time username availability check
  checkUsername() {
    const username = this.signUpForm.get('username')?.value;
    if (username && username.length >= 3) {
      this.authService.checkUsername(username).subscribe({
        next: (response) => {
          if (response.data.exists) {
            this.signUpForm.get('username')?.setErrors({ usernameTaken: true });
          }
        }
      });
    }
  }

  // Optional: Real-time email availability check
  checkEmail() {
    const email = this.signUpForm.get('email')?.value;
    if (email && this.signUpForm.get('email')?.valid) {
      this.authService.checkEmail(email).subscribe({
        next: (response) => {
          if (response.data.exists) {
            this.signUpForm.get('email')?.setErrors({ emailTaken: true });
          }
        }
      });
    }
  }
}
```

---

### Step 3: Update HTML Template

```html
<!-- sign-up.component.html -->
<form [formGroup]="signUpForm" (ngSubmit)="onSubmit()">
  
  <!-- Success Message -->
  <div *ngIf="successMessage" class="alert alert-success">
    {{ successMessage }}
  </div>

  <!-- Error Message -->
  <div *ngIf="errorMessage" class="alert alert-danger">
    {{ errorMessage }}
  </div>

  <!-- Username -->
  <div class="form-group">
    <input 
      type="text" 
      formControlName="username" 
      (blur)="checkUsername()"
      class="form-control"
      placeholder="Username">
    <div *ngIf="signUpForm.get('username')?.errors?.['usernameTaken']" class="error">
      Username is already taken
    </div>
  </div>

  <!-- Email -->
  <div class="form-group">
    <input 
      type="email" 
      formControlName="email" 
      (blur)="checkEmail()"
      class="form-control"
      placeholder="Email">
    <div *ngIf="signUpForm.get('email')?.errors?.['emailTaken']" class="error">
      Email is already registered
    </div>
  </div>

  <!-- Password -->
  <div class="form-group">
    <input 
      type="password" 
      formControlName="password"
      class="form-control"
      placeholder="Password">
  </div>

  <!-- Confirm Password -->
  <div class="form-group">
    <input 
      type="password" 
      formControlName="confirmPassword"
      class="form-control"
      placeholder="Confirm Password">
    <div *ngIf="signUpForm.get('confirmPassword')?.errors?.['passwordMismatch']" class="error">
      Passwords do not match
    </div>
  </div>

  <!-- Submit Button -->
  <button 
    type="submit" 
    [disabled]="signUpForm.invalid || loading"
    class="btn btn-primary">
    {{ loading ? 'Registering...' : 'Sign Up' }}
  </button>
</form>
```

---

### Step 4: Import HttpClientModule

In your `app.module.ts`:

```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    // ... other imports
    HttpClientModule
  ],
  // ...
})
export class AppModule { }
```

---

## Running the Application

### Backend:
```bash
cd backend/appvengers
./mvnw spring-boot:run
```
Backend will run on: `http://localhost:8081`

### Frontend:
```bash
cd frontend
ng serve
```
Frontend will run on: `http://localhost:4200`

---

## Testing the Integration

1. Start the backend server (port 8081)
2. Start the Angular frontend (port 4200)
3. Navigate to the signup page
4. Fill in the form and submit
5. Check the console for success/error messages

---

## Next Steps

1. ✅ **Completed:**
   - User Entity with JPA
   - User Repository
   - User Service with BCrypt
   - Auth Controller with REST endpoints
   - CORS configuration
   - Email verification token system

2. **To Be Implemented (Future):**
   - Email sending service (SMTP configuration)
   - JWT authentication for login
   - Password reset functionality
   - User profile endpoints
   - Role-based access control

---

## Database Tables Created

The application automatically creates the following table:

```sql
users (
  id, username, email, password, 
  is_active, email_verified, verification_token,
  created_at, updated_at
)
```

Check your MySQL database at Hostinger to see the created table and data.

---

## Troubleshooting

### CORS Issues:
- Ensure backend is running on port 8081
- Check SecurityConfig and AppConfig for CORS settings
- Frontend must be on http://localhost:4200

### Connection Issues:
- Verify MySQL connection in application.properties
- Check if port 8081 is available
- Test endpoints with Postman or cURL first

### Validation Errors:
- Username: 3-50 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Passwords must match

---

## Support

For issues or questions, check:
1. Backend console logs
2. Frontend console (F12)
3. Network tab in browser dev tools
4. API_DOCUMENTATION.md for endpoint details
