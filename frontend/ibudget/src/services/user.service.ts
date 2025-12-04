import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/user`;

    constructor(private http: HttpClient) { }

    updateAccount(data: {
        username: string;
        email: string;
        password: string;
    }): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.apiUrl}/update`, data);
    }
}
