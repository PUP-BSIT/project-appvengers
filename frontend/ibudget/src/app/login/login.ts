import { CommonModule, } from '@angular/common';
import { Component, signal, inject  } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
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

  fb = inject(FormBuilder);
  router = inject(Router);

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
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      // Navigate to dashboard or home page after successful login
      this.router.navigate(['/dashboard']);
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
