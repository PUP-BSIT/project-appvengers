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

@Component({
  selector: 'app-security',
  imports: [Sidebar, Header, ReactiveFormsModule, SubHeader, RouterLink],
  templateUrl: './security.html',
  styleUrl: './security.scss',
})
export class Security {
  securitySettingsForm: FormGroup;
  formBuilder = inject(FormBuilder);
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor() {
    this.securitySettingsForm = this.formBuilder.group({
      current_password: ['', {
        validators: [Validators.required]
      }],
      new_password: ['', {
        validators: [Validators.minLength(12)]
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
}
