import { CommonModule, } from '@angular/common';
import { Component, signal, inject  } from '@angular/core';
import { RouterLink } from '@angular/router';
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
      console.log("Login data:", this.loginForm.value);
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
