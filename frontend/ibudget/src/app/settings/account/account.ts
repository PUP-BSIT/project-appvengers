import { Component, inject, OnInit, signal } from '@angular/core';
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
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-account',
  imports: [Sidebar, Header, ReactiveFormsModule, SubHeader],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  accountSettingsForm: FormGroup;
  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  usernameFirstLetter = signal("");
  userName = signal("");

  constructor() {
    this.accountSettingsForm = this.formBuilder.group({
      email: ['', {
        validators: [Validators.required, Validators.email]
      }],
      username: ['', {
        validators: [Validators.required]
      }],
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
}
