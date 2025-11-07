import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {
  loginForm: FormGroup;
  hidePassword = signal(true);
  submitted = signal(false);
  errorMessage = signal('');

  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService); 

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', {
        validators: [Validators.required, Validators.email]
      }],
      password: ['', {
        validators: [Validators.required]
      }]
    });
  }

  onLogin(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Login successful:', response);
            this.router.navigate(['/dashboard']); // Navigate to dashboard on success
          } else {
            this.errorMessage.set(response.message || 'Login failed');
          }
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.errorMessage.set('Invalid email or password');
        }
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}