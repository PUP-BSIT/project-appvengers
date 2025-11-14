import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse, AuthData, SignupRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  signup(userData: SignupRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/signup`, userData);
  }

  checkUsername(username: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/check-username/${username}`);
  }

  checkEmail(email: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/check-email/${email}`);
  }

  verifyEmail(token: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/verify-email?token=${token}`);
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthData>> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: ApiResponse<AuthData>) => {
        if (res.success && res.data?.token) {
          // store JWT token string in localStorage
          localStorage.setItem('iBudget_authToken', res.data.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('iBudget_authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('iBudget_authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getProfile(): Observable<ApiResponse<{ username: string; email: string }>> {
    const token = this.getToken();
    return this.http.get<ApiResponse<{ username: string; email: string }>>(
      `${environment.apiUrl}/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}