import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  submitted = signal(false);
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
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.authService.login(loginData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              console.log('Login successful:', response);
              this.router.navigate(['/dashboard']);
            } else {
              this.errorMessage.set(response.message || 'Login failed');
            }
          },
          error: (err) => {
            console.error('Login failed:', err);
            if (err.status === 429) {
              this.errorMessage.set('Too many login attempts. Please try again later.');
            } else if(err.status === 401 && err.error?.lockedUntil) {
              const lockedUntil = new Date(err.error.lockedUntil);
              const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
              this.errorMessage.set(`Account locked. Try again in ${minutesLeft} minutes.`);
            } else {
              this.errorMessage.set('Invalid email or password');
            }
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}