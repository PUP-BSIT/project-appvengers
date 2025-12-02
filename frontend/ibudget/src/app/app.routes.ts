import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { Login } from './login/login';
import { SignUp } from './sign-up/sign-up';
import { EmailVerification } from './email-verification/email-verification';
import { SetupAccount } from './setup-account/setup-account';
import { Dashboard } from './dashboard/dashboard';
import { Budgets } from './budgets/budgets';
import { Categories } from './categories/categories';
import { authGuard } from './guards/auth.guard';
import { emailVerificationGuard } from './guards/email-verification.guard';
import { resendVerificationGuard } from './guards/resend-verification.guard';

export const routes: Routes = [
  {
    path: '', 
    loadComponent: () => import('./landing-page/landing-page')
      .then(m => m.LandingPage)
  },
  {
    path: 'auth-page',
    loadComponent: () => import('./auth-page/auth-page')
      .then(m => m.AuthPage)
  },
  // {
  //   path: 'login-page', 
  //   loadComponent: () => import('./login/login')
  //     .then(m => m.Login)
  // },
  // {
  //   path: 'signup-page', 
  //   loadComponent: () => import('./sign-up/sign-up')
  //     .then(m => m.SignUp)
  // },
  {
    path: 'email-verified', 
    loadComponent: () => import('./email-verification/email-verification')
      .then(m => m.EmailVerification),
    canActivate: [emailVerificationGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password')
      .then(m => m.ForgotPassword)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password')
      .then(m => m.ResetPassword)
  },
  {
    path: 'setup-account', 
    loadComponent: () => import('./setup-account/setup-account')
      .then(m => m.SetupAccount)
  },
  {
    path: 'resend-verification', 
    loadComponent: () => import('./resend-verification/resend-verification')
      .then(m => m.ResendVerification),
    canActivate: [resendVerificationGuard]
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
      .then(m => m.Transactions),
    canActivate: [authGuard]
  },
  {
    path: 'budgets', 
    loadComponent: () => import('./budgets/budgets')
      .then(m => m.Budgets)
  },
  {
    path: 'budgets/view-budget/:id',
    loadComponent: () => import('./budgets/budget-list/view-budget/view-budget')
      .then(m => m.ViewBudget)
  },
  {
    path: 'savings', 
    loadComponent: () => import('./savings/savings')
      .then(m => m.Savings)
  },
  {
    path: 'savings/add-saving',
    loadComponent: () => import('./savings/add-saving/add-saving')
      .then(m => m.AddSaving)
  },
  {
    path: 'savings/update-saving/:id',
    loadComponent: () => import('./savings/update-saving/update-saving')
      .then(m => m.UpdateSaving)
  },
  {
    path: 'savings/view-saving/:id',
    loadComponent: () => import('./savings/view-saving/view-saving')
      .then(m => m.ViewSaving)
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
  {
    path: 'settings/account/:id',
    loadComponent: () => import('./settings/account/account')
      .then(m => m.Account)
  },
  {
    path: 'settings/security/:id',
    loadComponent: () => import('./settings/security/security')
      .then(m => m.Security)
  },
  { 
    path: '**', loadComponent: () =>
      import('./not-found/not-found').then(m => m.NotFound) 
  }
];
