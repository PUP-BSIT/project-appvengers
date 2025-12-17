import { Component, inject, OnInit, signal } from '@angular/core';
import { Header } from "../../header/header";
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { SubHeader } from "../sub-header/sub-header";
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { ToggleableSidebar } from "../../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-account',
  imports: [Header, ReactiveFormsModule, SubHeader, CommonModule, ToggleableSidebar],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  accountSettingsForm: FormGroup;
  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  userService = inject(UserService);
  usernameFirstLetter = signal("");
  userName = signal("");
  hidePassword = signal(true);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.accountSettingsForm = this.formBuilder.group({
      email: ['', {
        validators: [Validators.required, Validators.email]
      }],
      username: ['', {
        validators: [Validators.required]
      }],
      password: ['', {
        validators: [Validators.required]
      }]
    });
  }

  ngOnInit(): void {
    this.getUserInformation();
    this.getFirstLetter();
  }

  get email() {
    return this.accountSettingsForm.get('email');
  }

  get username() {
    return this.accountSettingsForm.get('username');
  }

  get password() {
    return this.accountSettingsForm.get('password');
  }

  getFirstLetter() {
    const firstLetter = this.userName().charAt(0).toUpperCase();
    this.usernameFirstLetter.set(firstLetter);
  }

  getUserInformation() {
    this.authService.getProfile().subscribe((res) => {
      if (res.success && res.data) {
        this.accountSettingsForm.patchValue({
          email: res.data.email,
          username: res.data.username
        });

        // Set username first letter signal
        this.userName.set(res.data.username);
        this.getFirstLetter();
      }
    })
  }

  onSubmit(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.accountSettingsForm.invalid) {
      Object.keys(this.accountSettingsForm.controls).forEach(key => {
        this.accountSettingsForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.accountSettingsForm.value;
    const updateData = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password
    };

    this.userService.updateAccount(updateData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          // Clear password field
          this.accountSettingsForm.patchValue({ password: '' });
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to update account. Please try again.'
        );
      }
    });
  }
}
