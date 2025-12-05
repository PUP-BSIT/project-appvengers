import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ChatbotService {
    private http = inject(HttpClient);
    // Proxy through backend to hide n8n URL and handle CORS
    private readonly apiUrl = `${environment.apiUrl}/chatbot/message`;

    isOpen = signal(false);

    sendMessage(message: string): Observable<any> {
        return this.http.post(this.apiUrl, { message });
    }

    toggle() {
        this.isOpen.update(v => !v);
    }
}
