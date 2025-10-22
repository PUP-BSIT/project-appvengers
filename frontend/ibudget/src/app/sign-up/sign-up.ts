import { CommonModule, } from '@angular/common';
import { Component, signal, inject  } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
    imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss'
})
export class SignUp {
  signupForm: FormGroup;
  hidePassword = signal(true);
  submitted = signal(false);

  fb = inject(FormBuilder);

  constructor() {
    this.signupForm = this.fb.group({
      username: ['', { 
        validators: [Validators.required, Validators.minLength(3)]
      }],
      email: ['', { 
        validators: [Validators.required, Validators.email]
      }],
      password: ['', { 
        validators: [Validators.required, Validators.minLength(6)]
      }],
      confirmPassword: ['', {
        validators: [Validators.required] 
      }]
    }, { 
      validators: this.passwordMatchValidator
    });
  }

  onSignup(): void {
    this.submitted.set(true);
    if (this.signupForm.valid) {
      console.log("Signup data:", this.signupForm.value);
    }
  }

  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && 
        password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get username() {
    return this.signupForm.get('username');
  }

  get email() {
    return this.signupForm.get('email');
  }
  
  get password() {
    return this.signupForm.get('password');
  }
}
