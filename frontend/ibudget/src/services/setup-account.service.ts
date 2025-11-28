import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { AccountSetupResponse, ApiResponse } from '../models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class SetupAccountService {
  private apiUrl = `${environment.apiUrl}/auth`;
  http = inject(HttpClient);

  verifyAccountSetupToken(
    token: string,
    username: string,
    accountSetupResponse: AccountSetupResponse
  ): Observable<ApiResponse> {
    const url =
      `
        ${this.apiUrl}/verify-account-setup?token=${encodeURIComponent(token)}
        &username=${encodeURIComponent(username)}
      `;

    // body is the User-like object expected by the backend
    return this.http.put<ApiResponse>(url, accountSetupResponse, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}
