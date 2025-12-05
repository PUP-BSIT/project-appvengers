import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatbotService {
    private http = inject(HttpClient);
    // Proxy through backend to hide n8n URL and handle CORS
    private readonly apiUrl = 'http://localhost:8081/api/chatbot/message';

    isOpen = signal(false);

    sendMessage(message: string): Observable<any> {
        return this.http.post(this.apiUrl, { message });
    }

    toggle() {
        this.isOpen.update(v => !v);
    }
}
