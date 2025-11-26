import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ResendEmailService {
  private apiUrl = `${environment.apiUrl}/auth`;
  http = inject(HttpClient);

  resendVerificationEmail(email: string): Observable<ApiResponse> {
    const url = `${this.apiUrl}/resend-verification`;
    const params = new HttpParams().set('email', email);
    return this.http.post<ApiResponse>(url, {}, { params });
  }
}
