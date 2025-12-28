import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators } from '@angular/forms';

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

export class Login implements OnDestroy {
  loginForm: FormGroup;
  hidePassword = signal(true);
  isSubmitting = signal(false);
  isGoogleLoading = signal(false);
  errorMessage = signal('');

  private destroy$ = new Subject<void>();

  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', { validators: [Validators.required, Validators.email] }],
      password: ['', { validators: [Validators.required] }]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const loginData = this.loginForm.value;

    this.authService.login(loginData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Login successful:', response);
            this.router.navigate(['/dashboard']);
          } else {
            console.log('Login failed:', response);
            this.errorMessage.set(response.message || 'Login failed');
          }
        }, 
        error: (err) => {
          console.error('Login failed:', err);
          if (err.status === 429) {
            this.errorMessage.set(
              'Too many login attempts. Please try again later.');
          } else if(err.status === 401 && err.error?.lockedUntil) {
            const lockedUntil = new Date(err.error.lockedUntil);
            const minutesLeft = Math.ceil(
              (lockedUntil.getTime() - Date.now()) / 60000);
            this.errorMessage.set(
              `Account locked. Try again in ${minutesLeft} minutes.`);
          } else {
            this.errorMessage.set(err.error?.message || 'Invalid email or password');
          }
        }
      });
  }

  /**
   * Initiates Google OAuth2 login flow.
   * Redirects to backend OAuth2 authorization endpoint.
   */
  signInWithGoogle(): void {
    if (this.isGoogleLoading() || this.isSubmitting()) {
      return;
    }
    
    this.isGoogleLoading.set(true);
    this.errorMessage.set('');
    
    // Redirect to backend OAuth2 endpoint
    // Spring Security will handle the Google OAuth flow
    window.location.href = this.authService.getGoogleOAuthUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}