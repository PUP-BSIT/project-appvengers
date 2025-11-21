import { Component, inject, signal } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { 
    FormGroup, 
    FormControl,
    ReactiveFormsModule, 
    FormBuilder,
    Validators
  } from '@angular/forms';
import { SubHeader } from "../sub-header/sub-header";

@Component({
  selector: 'app-security',
  imports: [Sidebar, Header, ReactiveFormsModule, SubHeader],
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
