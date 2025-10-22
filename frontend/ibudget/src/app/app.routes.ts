import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { SignUp } from './sign-up/sign-up';
import { EmailVerification } from './email-verification/email-verification';
import { SetupAccount } from './setup-account/setup-account';

export const routes: Routes = [
  {path: '', component: LandingPage},
  {path: 'signup-page', component: SignUp},
  {path: 'email-verification', component: EmailVerification}
  {path: 'setup-account', component: SetupAccount}
];
