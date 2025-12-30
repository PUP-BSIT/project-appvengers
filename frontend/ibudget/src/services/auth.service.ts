import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse, AuthData, SignupRequest, ReactivateAccountRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);

  signup(userData: SignupRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/signup`, userData);
  }

  checkUsername(username: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`
      ${this.apiUrl}/check-username/${username}
    `);
  }

  checkEmail(email: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/check-email/${email}`);
  }

  verifyEmail(token: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`
      ${this.apiUrl}/verify-email?token=${token}
    `);
  }

  login(
    credentials: { email: string; password: string }
  ): Observable<ApiResponse<AuthData>> {
    return this.http.post<ApiResponse<AuthData>>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(
        tap((res: ApiResponse<AuthData>) => {
          if (res.success && res.data?.token) {
            // store JWT token string in localStorage
            localStorage.setItem(
              'iBudget_authToken',
              res.data.token
            );
          }
        })
      );
  }

  logout(): void {
    // Clear ALL localStorage items to prevent data leakage between accounts
    localStorage.removeItem('iBudget_authToken');
    localStorage.removeItem('iBudget_username');
    
    // Clear ALL iBudget-prefixed items (comprehensive cleanup)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('iBudget_') || key.startsWith('chatbot_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Also clear sessionStorage (if any session data exists)
    sessionStorage.clear();
    
    // Note: Services should be cleared by the header component calling their clearState() methods
    // This includes: NotificationService.clearState(), WebSocketService.disconnect()
    console.log('🚪 User logged out - all storage cleared');
  }

  getToken(): string | null {
    return localStorage.getItem('iBudget_authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getProfile(): Observable<ApiResponse<{ id: number, username: string; email: string; hasPassword: boolean }>> {
    const token = this.getToken();
    return this.http.get<ApiResponse<{ id: number, username: string; email: string; hasPassword: boolean }>>(
      `${environment.apiUrl}/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  forgotPassword(data: { email: string }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, data);
  }

  validateResetToken(token: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`
      ${this.apiUrl}/validate-reset-token?token=${token}
    `);
  }

  resetPassword(
    data: { token: string; newPassword: string; confirmPassword: string }
  ): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, data);
  }

changePassword(
    data: { 
      currentPassword: string; 
      newPassword: string; 
      confirmPassword: string 
    }): Observable<ApiResponse> {
      return this.http.post<ApiResponse>(`${this.apiUrl}/change-password`, data);
    }

  /**
   * Reactivate a deactivated account.
   * Requires email and password verification.
   * Returns JWT token on success for auto-login.
   */
  reactivateAccount(data: ReactivateAccountRequest): Observable<ApiResponse<AuthData>> {
    return this.http.post<ApiResponse<AuthData>>(
      `${this.apiUrl}/reactivate`,
      data
    ).pipe(
      tap((res: ApiResponse<AuthData>) => {
        if (res.success && res.data?.token) {
          localStorage.setItem('iBudget_authToken', res.data.token);
        }
      })
    );
  }

  /**
   * Handle OAuth2 callback from backend.
   * Stores the JWT token received after successful Google OAuth.
   */
  handleOAuthCallback(token: string, username: string): void {
    localStorage.setItem('iBudget_authToken', token);
    if (username) {
      localStorage.setItem('iBudget_username', username);
    }
    console.log('OAuth token stored successfully');
  }

  /**
   * Get the OAuth2 authorization URL for Google login.
   * Redirects to backend which handles the OAuth flow.
   */
  getGoogleOAuthUrl(): string {
    return environment.oauth2GoogleUrl;
  }
}