import { Component, inject, signal } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { SubHeader } from "../sub-header/sub-header";
import { RouterLink } from '@angular/router';
import { 
    FormGroup, 
    FormControl,
    ReactiveFormsModule, 
    FormBuilder,
    Validators
  } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security',
  imports: [Sidebar, Header, ReactiveFormsModule, SubHeader, RouterLink, CommonModule],
  templateUrl: './security.html',
  styleUrl: './security.scss',
})
export class Security {
  securitySettingsForm: FormGroup;
  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);
  
  // Status flags
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.securitySettingsForm = this.formBuilder.group({
      current_password: ['', {
        validators: [Validators.required]
      }],
      new_password: ['', {
        validators: [Validators.required, Validators.minLength(8)]
      }],
      confirm_password: ['', {
        validators: [Validators.required]
      }]
    });
  }

  get currentPassword() {
    return this.securitySettingsForm.get('current_password');
  }

  get newPassword() {
    return this.securitySettingsForm.get('new_password');
  }

  get confirmPassword() {
    return this.securitySettingsForm.get('confirm_password');
  }

  onSubmit(): void {
    // Clear previous messages
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // Validate form
    if (this.securitySettingsForm.invalid) {
      Object.keys(this.securitySettingsForm.controls).forEach(key => {
        this.securitySettingsForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Check if passwords match
    const formValue = this.securitySettingsForm.value;
    if (formValue.new_password !== formValue.confirm_password) {
      this.errorMessage.set('New password and confirm password do not match');
      return;
    }

    this.isSubmitting.set(true);

    const changePasswordData = {
      currentPassword: formValue.current_password,
      newPassword: formValue.new_password,
      confirmPassword: formValue.confirm_password
    };

    this.authService.changePassword(changePasswordData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          this.securitySettingsForm.reset();
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to change password. Please try again.'
        );
      }
    });
  }
}
