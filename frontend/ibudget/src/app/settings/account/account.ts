import { Component, inject } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { 
    FormGroup, 
    FormControl,
    ReactiveFormsModule, 
    FormBuilder,
    Validators
  } from '@angular/forms';

@Component({
  selector: 'app-account',
  imports: [Sidebar, Header, ReactiveFormsModule],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  accountSettingsForm: FormGroup;
  formBuilder = inject(FormBuilder);

  constructor() {
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
}
