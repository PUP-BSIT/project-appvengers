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

    // Unique session ID for conversation continuity with n8n AI agent
    private readonly sessionId = this.generateSessionId();

    isOpen = signal(false);

    sendMessage(message: string): Observable<any> {
        return this.http.post(this.apiUrl, {
            message,
            sessionId: this.sessionId
        });
    }

    toggle() {
        this.isOpen.update(v => !v);
    }

    /**
     * Generates a unique session ID for the chatbot conversation.
     * Uses a combination of timestamp and random string for uniqueness.
     */
    private generateSessionId(): string {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 10);
        return `chat-${timestamp}-${randomPart}`;
    }

    /**
     * Gets the current session ID (useful for debugging).
     */
    getSessionId(): string {
        return this.sessionId;
    }
}
