import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
    text: string;
    isUser: boolean;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ChatbotService {
    private http = inject(HttpClient);
    // Proxy through backend to hide n8n URL and handle CORS
    private readonly apiUrl = `${environment.apiUrl}/chatbot/message`;

    // Session and message persistence keys
    private readonly SESSION_STORAGE_KEY = 'bonzi_session_id';
    private readonly MESSAGES_STORAGE_KEY = 'bonzi_chat_history';
    
    // Unique session ID for conversation continuity with n8n AI agent
    private _sessionId: string | null = null;

    isOpen = signal(false);

    get sessionId(): string {
        try {
            const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);
            if (stored) {
                return stored;
            }
        } catch (error) {
            // Ignore
        }
        if (!this._sessionId) {
            this._sessionId = this.generateSessionId();
            this.saveSessionId(this._sessionId);
        }
        return this._sessionId;
    }

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
     * Loads existing session ID from localStorage or generates a new one.
     * This ensures conversation continuity across page refreshes.
     */
    private loadOrGenerateSessionId(): string {
        try {
            const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);
            if (stored) {
                return stored;
            }
        } catch (error) {
            console.warn('Failed to load session ID from localStorage:', error);
        }
        
        const newSessionId = this.generateSessionId();
        this.saveSessionId(newSessionId);
        return newSessionId;
    }

    /**
     * Saves session ID to localStorage for persistence.
     */
    private saveSessionId(sessionId: string): void {
        try {
            localStorage.setItem(this.SESSION_STORAGE_KEY, sessionId);
        } catch (error) {
            console.warn('Failed to save session ID to localStorage:', error);
        }
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

    /**
     * Saves chat messages to localStorage for persistence.
     */
    saveMessages(messages: ChatMessage[]): void {
        try {
            const serialized = messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp.toISOString()
            }));
            localStorage.setItem(this.MESSAGES_STORAGE_KEY, JSON.stringify(serialized));
        } catch (error) {
            console.warn('Failed to save messages to localStorage:', error);
        }
    }

    /**
     * Loads chat messages from localStorage.
     */
    loadMessages(): ChatMessage[] {
        try {
            const stored = localStorage.getItem(this.MESSAGES_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }
        } catch (error) {
            console.warn('Failed to load messages from localStorage:', error);
        }
        return [];
    }

    /**
     * Clears chat history and starts a new session.
     */
    clearHistory(): void {
        try {
            localStorage.removeItem(this.MESSAGES_STORAGE_KEY);
            localStorage.removeItem(this.SESSION_STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to clear chat history:', error);
        }
    }
}
