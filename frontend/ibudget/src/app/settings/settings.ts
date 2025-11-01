import { Component, inject, signal } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { SubHeader } from './sub-header/sub-header';
import { ViewportScroller } from '@angular/common';
import { 
    FormGroup, 
    FormControl,
    ReactiveFormsModule, 
    FormBuilder,
    Validators
  } from '@angular/forms';
import { SubHeader } from './sub-header/sub-header';

@Component({
  selector: 'app-settings',
  imports: [Sidebar, Header, SubHeader, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  accountSettingsForm: FormGroup;
  securitySettingsForm: FormGroup;
  formBuilder = inject(FormBuilder);
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor(private viewportScroller: ViewportScroller) {
    this.accountSettingsForm = this.formBuilder.group({
      birthdate: ['', {
        validators: [Validators.required]
      }],
      email: ['', {
        validators: [Validators.required, Validators.email]
      }],
      first_name: ['', {
        validators: [Validators.required]
      }],
      gender: ['', {
        validators: [Validators.required]
      }],
      last_name: ['', {
        validators: [Validators.required]
      }],
      middle_name: [''],
      username: ['', {
        validators: [Validators.required]
      }],
    });

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

  get birthdate() {
    return this.accountSettingsForm.get('birthdate');
  }

  get email() {
    return this.accountSettingsForm.get('email');
  }

  get gender() {
    return this.accountSettingsForm.get('gender');
  }

  get firstName() {
    return this.accountSettingsForm.get('first_name');
  }

  get middleName() {
    return this.accountSettingsForm.get('middle_name');
  }

  get lastName() {
    return this.accountSettingsForm.get('last_name');
  }

  get username() {
    return this.accountSettingsForm.get('username');
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

  scrollToPanel(anchorId: string) {
    this.viewportScroller.scrollToAnchor(anchorId);
  }
}
