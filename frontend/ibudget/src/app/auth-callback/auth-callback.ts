import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

/**
 * Handles OAuth2 callback from backend.
 * Receives JWT token from query params after successful Google OAuth.
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-callback-container">
      <div class="spinner-container" *ngIf="isProcessing()">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Completing sign in...</p>
      </div>
      <div class="error-container" *ngIf="error()">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error() }}
        </div>
        <button class="btn btn-primary" (click)="navigateToLogin()">
          Return to Login
        </button>
      </div>
    </div>
  `,
  styles: [`
    .auth-callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    .spinner-container {
      text-align: center;
    }
    .error-container {
      text-align: center;
      padding: 2rem;
    }
  `]
})
export class AuthCallback implements OnInit {
  isProcessing = signal(true);
  error = signal('');

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.processCallback();
  }

  private processCallback(): void {
    // Get token and username from query params
    const token = this.route.snapshot.queryParamMap.get('token');
    const username = this.route.snapshot.queryParamMap.get('username');
    const errorParam = this.route.snapshot.queryParamMap.get('error');

    if (errorParam) {
      this.isProcessing.set(false);
      this.error.set('Authentication failed: ' + errorParam);
      return;
    }

    if (!token) {
      this.isProcessing.set(false);
      this.error.set('No authentication token received');
      return;
    }

    // Store token and user info
    this.authService.handleOAuthCallback(token, username || '');
    if (!environment.production) {
      console.log('OAuth token stored successfully');
    }

    // Small delay to ensure localStorage is fully committed before navigation
    // This prevents race condition with auth guard reading token
    setTimeout(() => {
      if (!environment.production) {
        console.log('OAuth callback successful, navigating to dashboard');
      }
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }, 100);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth-page']);
  }
}
