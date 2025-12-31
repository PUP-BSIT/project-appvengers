import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LocalStorageService } from '../../services/local-storage.service';

/**
 * Visualization data returned by n8n for rendering charts in chat.
 * Enables generative UI with dynamic Chart.js visualizations.
 */
export interface ChatVisualization {
    /** Chart type to render */
    type: 'doughnut' | 'pie' | 'bar' | 'line';
    /** Optional title displayed above the chart */
    title?: string;
    /** Chart data with labels and values */
    data: {
        labels: string[];
        values: number[];
    };
    /** Optional custom colors (hex format) */
    colors?: string[];
}

export interface ChatMessage {
    text: string;
    isUser: boolean;
    timestamp: Date;
    action?: ChatbotAction;
    /** Optional visualization data for rendering charts */
    visualization?: ChatVisualization;
}

/**
 * Represents an action that Bonzi can suggest to the user.
 * Actions enable smart navigation with pre-filled forms.
 */
export interface ChatbotAction {
    /** Type of action to perform */
    type: 'navigate' | 'scroll' | 'open-modal';
    /** Route path for navigation (e.g., '/transactions', '/savings/add-saving') */
    path?: string;
    /** Query parameters to pass (e.g., { amount: 500, category: 'Food' }) */
    queryParams?: Record<string, string | number>;
    /** Element ID for scroll actions */
    elementId?: string;
    /** Button label to display (e.g., 'Add this transaction') */
    label?: string;
    /** Icon class for the button (e.g., 'bi-plus-circle') */
    icon?: string;
}

/**
 * Structured response from the chatbot that may include actions and visualizations.
 */
export interface ChatbotResponse {
    /** The text response to display */
    text?: string;
    output?: string;
    message?: string;
    response?: string;
    /** Optional action for the user to take */
    action?: ChatbotAction;
    /** Optional visualization data for rendering charts */
    visualization?: ChatVisualization;
    /** Optional error message */
    error?: string;
    /** Seconds to wait before retrying (for rate limit errors) */
    retryAfterSeconds?: number;
}

/**
 * Rate limit error response from the API (429 status).
 */
export interface RateLimitError {
    error: string;
    output: string;
    retryAfterSeconds: number;
}

/**
 * Constants for input validation (should match backend limits).
 */
export const CHATBOT_INPUT_LIMITS = {
    /** Maximum message length allowed */
    MAX_MESSAGE_LENGTH: 500,
    /** Minimum message length required */
    MIN_MESSAGE_LENGTH: 1
} as const;

@Injectable({
    providedIn: 'root'
})
export class ChatbotService {
    private http = inject(HttpClient);
    private localStorageService = inject(LocalStorageService);
    // Proxy through backend to hide n8n URL and handle CORS
    private readonly apiUrl = `${environment.apiUrl}/chatbot/message`;

    // Session and message persistence keys (user-scoped)
    private readonly SESSION_STORAGE_KEY = 'bonzi_session_id';
    private readonly MESSAGES_STORAGE_KEY = 'bonzi_chat_history';
    
    // Unique session ID for conversation continuity with n8n AI agent
    private _sessionId: string | null = null;

    isOpen = signal(false);
    
    // Signal to notify components when state is cleared (e.g., on logout)
    // Increment this value to trigger a reset in subscribers
    stateVersion = signal(0);

    get sessionId(): string {
        try {
            const stored = this.localStorageService.getItem<string>(this.SESSION_STORAGE_KEY);
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
     * Loads existing session ID from user-scoped localStorage or generates a new one.
     * This ensures conversation continuity across page refreshes for the same user.
     */
    private loadOrGenerateSessionId(): string {
        try {
            const stored = this.localStorageService.getItem<string>(this.SESSION_STORAGE_KEY);
            if (stored) {
                return stored;
            }
        } catch (error) {
            console.warn('[ChatbotService] Failed to load session ID:', error);
        }
        
        const newSessionId = this.generateSessionId();
        this.saveSessionId(newSessionId);
        return newSessionId;
    }

    /**
     * Saves session ID to user-scoped localStorage for persistence.
     */
    private saveSessionId(sessionId: string): void {
        try {
            this.localStorageService.setItem(this.SESSION_STORAGE_KEY, sessionId);
        } catch (error) {
            console.warn('[ChatbotService] Failed to save session ID:', error);
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
     * Saves chat messages to user-scoped localStorage for persistence.
     */
    saveMessages(messages: ChatMessage[]): void {
        try {
            const serialized = messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp.toISOString()
            }));
            this.localStorageService.setItem(this.MESSAGES_STORAGE_KEY, serialized);
        } catch (error) {
            console.warn('[ChatbotService] Failed to save messages:', error);
        }
    }

    /**
     * Loads chat messages from user-scoped localStorage.
     */
    loadMessages(): ChatMessage[] {
        try {
            const stored = this.localStorageService.getItem<any[]>(this.MESSAGES_STORAGE_KEY);
            if (stored) {
                return stored.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }
        } catch (error) {
            console.warn('[ChatbotService] Failed to load messages:', error);
        }
        return [];
    }

    /**
     * Clears chat history and starts a new session.
     */
    clearHistory(): void {
        try {
            this.localStorageService.removeItem(this.MESSAGES_STORAGE_KEY);
            this.localStorageService.removeItem(this.SESSION_STORAGE_KEY);
            if (!environment.production) {
                console.log('[ChatbotService] Chat history cleared');
            }
        } catch (error) {
            console.warn('[ChatbotService] Failed to clear chat history:', error);
        }
    }

    /**
     * Clear state on logout (called by header component)
     */
    clearState(): void {
        if (!environment.production) {
            console.log('[ChatbotService] Clearing chatbot state');
        }
        this._sessionId = null;
        // Close the chatbot sidebar
        this.isOpen.set(false);
        // Increment stateVersion to notify subscribers to reset their local state
        this.stateVersion.update(v => v + 1);
    }
}
