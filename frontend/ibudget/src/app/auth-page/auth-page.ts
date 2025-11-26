import { Component, signal, WritableSignal } from '@angular/core';
import { Login } from "../login/login";
import { SignUp } from '../sign-up/sign-up';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-page',
  imports: [Login, SignUp, CommonModule],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPage {
  isLoginMode: WritableSignal<boolean> = signal(true);

  setLoginMode() {
    this.isLoginMode.set(true);
  }

  setSignupMode() {
    this.isLoginMode.set(false);
  }
}
