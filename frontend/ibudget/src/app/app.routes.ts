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
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '', 
    loadComponent: () => import('./landing-page/landing-page')
      .then(m => m.LandingPage)
  },
  {
    path: 'login-page', 
    loadComponent: () => import('./login/login')
      .then(m => m.Login)
  },
  {
    path: 'signup-page', 
    loadComponent: () => import('./sign-up/sign-up')
      .then(m => m.SignUp)
  },
  {
    path: 'email-verification', 
    loadComponent: () => import('./email-verification/email-verification')
      .then(m => m.EmailVerification)
  },
  {
    path: 'setup-account', 
    loadComponent: () => import('./setup-account/setup-account')
      .then(m => m.SetupAccount)
  },
  {
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard')
      .then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'transactions', 
    loadComponent: () => import('./transactions/transactions')
      .then(m => m.Transactions)
  },
  {
    path: 'budgets', 
    loadComponent: () => import('./budgets/budgets')
      .then(m => m.Budgets)
  },
  {
    path: 'categories', 
    loadComponent: () => import('./categories/categories')
      .then(m => m.Categories)
  },
  {
    path: 'reports', 
    loadComponent: () => import('./reports/reports')
      .then(m => m.Reports)
  },
  {
    path: 'notifications', 
    loadComponent: () => import('./notifications/notifications')
      .then(m => m.Notifications)
  },
  {
    path: 'settings', 
    loadComponent: () => import('./settings/settings')
      .then(m => m.Settings)
  },
];
