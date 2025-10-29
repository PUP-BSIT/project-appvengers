import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { Login } from './login/login';
import { SignUp } from './sign-up/sign-up';
import { EmailVerification } from './email-verification/email-verification';
import { SetupAccount } from './setup-account/setup-account';
import { Dashboard } from './dashboard/dashboard';
import { Budgets } from './budgets/budgets';
import { Transactions } from './transactions/transactions';
import { Categories } from './categories/categories';

export const routes: Routes = [
  {path: '', component: LandingPage},
  {path: 'login-page', component: Login},
  {path: 'signup-page', component: SignUp},
  {path: 'email-verification', component: EmailVerification},
  {path: 'setup-account', component: SetupAccount},
  {path: 'dashboard', component: Dashboard },
  {path: 'transactions', component: Transactions},
  {path: 'budgets', component: Budgets},
  {path: 'categories', component: Categories}
];
