import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss'
})

export class SignUp {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  signupForm: FormGroup;
  hidePassword = signal(true);
  submitted = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor() {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
    }
    return null;
  }

  onSignup(): void {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.signupForm.invalid) return;

    this.loading.set(true);
    this.auth.signup(this.signupForm.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        this.loading.set(false);
        const msg = error?.error?.message || 'An error occurred during registration';
        this.errorMessage.set(msg);
      }
    });
  }

  checkUsername(): void {
    const username = this.signupForm.get('username')?.value;
    if (username && username.length >= 3) {
      this.auth.checkUsername(username).subscribe({
        next: (response) => {
          const control = this.signupForm.get('username');
          if (response.data.exists) {
            control?.setErrors({ usernameTaken: true });
          } else if (control?.hasError('usernameTaken')) {
            control.setErrors(null);
          }
        }
      });
    }
  }

  checkEmail(): void {
    const email = this.signupForm.get('email')?.value;
    if (email && this.signupForm.get('email')?.valid) {
      this.auth.checkEmail(email).subscribe({
        next: (response) => {
          if (response.data.exists) {
            this.signupForm.get('email')?.setErrors({ emailTaken: true });
          } else {
            const control = this.signupForm.get('email');
            if (control?.hasError('emailTaken')) {
              control.setErrors(null);
            }
          }
        }
      });
    }
  }


  get username() { return this.signupForm.get('username'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
}
