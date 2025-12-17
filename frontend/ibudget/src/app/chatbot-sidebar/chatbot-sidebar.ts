import { Component, signal, inject, effect, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService, ChatMessage, ChatbotAction, ChatbotResponse } from './chatbot.service';
import { finalize } from 'rxjs/operators';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Component({
    selector: 'app-chatbot-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chatbot-sidebar.html',
    styleUrl: './chatbot-sidebar.scss'
})
export class ChatbotSidebar implements AfterViewChecked, OnInit {
    private chatbotService = inject(ChatbotService);
    private sanitizer = inject(DomSanitizer);
    private router = inject(Router);

    // isOpen = signal(false); // Removed local state
    isOpen = this.chatbotService.isOpen;
    isLoading = signal(false);
    messages = signal<ChatMessage[]>([]);
    userInput = signal('');
    loadingWord = signal('Thinking...');
    lastError = signal<string | null>(null);
    showWelcome = signal(true);

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    private readonly funWords = [
        'Thinking...', 'Processing...', 'Analyzing...', 'Computing...',
        'Brainstorming...', 'Consulting the oracle...', 'Doing math...',
        'Connecting dots...', 'Loading wisdom...', 'Asking the stars...'
    ];

    readonly quickActions = [
        { icon: 'bi-pie-chart', text: 'Show my spending', prompt: 'Show me a breakdown of my spending by category' },
        { icon: 'bi-lightbulb', text: 'Budget tips', prompt: 'Give me some budgeting tips for students' },
        { icon: 'bi-plus-circle', text: 'How to add transaction', prompt: 'How do I add a new transaction?' },
        { icon: 'bi-piggy-bank', text: 'Savings advice', prompt: 'How can I save more money?' }
    ];

    constructor() {
        effect(() => {
            if (this.isLoading()) {
                const interval = setInterval(() => {
                    const randomIndex = Math.floor(Math.random() * this.funWords.length);
                    this.loadingWord.set(this.funWords[randomIndex]);
                }, 800);
                return () => clearInterval(interval);
            }
            return undefined;
        });

        // Save messages to localStorage whenever they change
        effect(() => {
            const msgs = this.messages();
            if (msgs.length > 0) {
                this.chatbotService.saveMessages(msgs);
            }
        });
    }

    ngOnInit() {
        // Load persisted messages on component init
        const savedMessages = this.chatbotService.loadMessages();
        if (savedMessages.length > 0) {
            this.messages.set(savedMessages);
            this.showWelcome.set(false);
        } else {
            // Show welcome message for new sessions
            this.addWelcomeMessage();
        }
    }

    private addWelcomeMessage() {
        const welcomeMsg: ChatMessage = {
            text: "👋 Hi! I'm **Bonzi**, your AI Financial Assistant for iBudget!\n\nI'm here to help you manage your budget, track expenses, and achieve your financial goals. Feel free to ask me anything about budgeting or use the quick actions below!",
            isUser: false,
            timestamp: new Date()
        };
        this.messages.set([welcomeMsg]);
        this.showWelcome.set(false);
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    toggleSidebar() {
        this.chatbotService.toggle();
    }

    sendMessage() {
        const text = this.userInput().trim();
        if (!text || this.isLoading()) return;

        this.sendMessageWithText(text);
    }

    private sendMessageWithText(text: string) {
        // Add user message
        this.messages.update(msgs => [...msgs, { text, isUser: true, timestamp: new Date() }]);
        this.userInput.set('');
        this.isLoading.set(true);
        this.lastError.set(null);

this.chatbotService.sendMessage(text)
            .subscribe({
                next: (response: ChatbotResponse | any) => {
                    // Handle null/undefined response
                    if (!response) {
                        this.handleError("Sorry, I received an empty response. Please try again.");
                        return;
                    }
                    
                    // Parse the response to extract text and action
                    const parsed = this.parseResponse(response);
                    
                    // Create message with optional action
                    const botMessage: ChatMessage = {
                        text: parsed.text,
                        isUser: false,
                        timestamp: new Date(),
                        action: parsed.action
                    };
                    
                    this.messages.update(msgs => [...msgs, botMessage]);
                    this.isLoading.set(false);
                },
                error: (error) => {
                    // Extract user-friendly error message from error object
                    let errorMessage = "Sorry, I couldn't reach the server. Please try again.";
                    
                    if (error) {
                        // Try to extract error message from various possible structures
                        if (typeof error === 'string') {
                            errorMessage = error;
                        } else if (error.error) {
                            errorMessage = typeof error.error === 'string' 
                                ? error.error 
                                : error.error.message || errorMessage;
                        } else if (error.message) {
                            errorMessage = error.message;
                        }
                    }
                    
                    this.handleError(errorMessage);
                    this.isLoading.set(false);
                }
            });
    }

    private handleError(errorMessage: string) {
        this.lastError.set(errorMessage);
        this.messages.update(msgs => [...msgs, { text: errorMessage, isUser: false, timestamp: new Date() }]);
    }

    retryLastMessage() {
        // Get the last user message and resend it
        const userMessages = this.messages().filter(m => m.isUser);
        if (userMessages.length > 0) {
            const lastUserMessage = userMessages[userMessages.length - 1];
            this.sendMessageWithText(lastUserMessage.text);
        }
    }

    sendQuickAction(prompt: string) {
        this.userInput.set(prompt);
        this.sendMessage();
    }

    clearChat() {
        this.messages.set([]);
        this.chatbotService.clearHistory();
        this.addWelcomeMessage();
        this.lastError.set(null);
    }

    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

parseMarkdown(text: string): SafeHtml {
        const rawHtml = marked.parse(text) as string;
        // Sanitize HTML to prevent XSS attacks before bypassing Angular's security
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
    }

    /**
     * Parses the chatbot response to extract text and optional action.
     * Handles both plain text responses and structured JSON responses.
     */
    private parseResponse(response: ChatbotResponse | any): { text: string; action?: ChatbotAction } {
        // If response is a string, return as-is
        if (typeof response === 'string') {
            return { text: response };
        }

        // Extract text from various possible response structures
        let text = response.output || response.text || response.message || response.response || '';
        
        // If text is empty and response is an object, stringify it
        if (!text && typeof response === 'object') {
            // Check if it's an error response
            if (response.error) {
                text = response.error;
            } else {
                text = JSON.stringify(response);
            }
        }

        // Check for embedded JSON action in the text (n8n may return JSON in text)
        let action = response.action;
        if (!action && typeof text === 'string') {
            action = this.extractActionFromText(text);
            if (action) {
                // Remove the JSON block from the displayed text
                text = this.removeJsonFromText(text);
            }
        }

        return { text, action };
    }

    /**
     * Extracts a ChatbotAction from text that may contain embedded JSON.
     * Looks for JSON blocks marked with ```json or raw JSON objects.
     */
    private extractActionFromText(text: string): ChatbotAction | undefined {
        // Pattern 1: Look for ```json ... ``` blocks with action
        const jsonBlockRegex = /```json\s*(\{[\s\S]*?"action"[\s\S]*?\})\s*```/i;
        const blockMatch = text.match(jsonBlockRegex);
        if (blockMatch) {
            try {
                const parsed = JSON.parse(blockMatch[1]);
                if (parsed.action) {
                    return this.normalizeAction(parsed.action);
                }
            } catch (e) {
                // Invalid JSON, ignore
            }
        }

        // Pattern 2: Look for [ACTION:...] markers (simple format for n8n)
        const actionMarkerRegex = /\[ACTION:(\w+):([^\]]+)\]/i;
        const markerMatch = text.match(actionMarkerRegex);
        if (markerMatch) {
            const [, type, path] = markerMatch;
            if (type.toLowerCase() === 'navigate') {
                return {
                    type: 'navigate',
                    path: path.split('?')[0],
                    queryParams: this.parseQueryString(path),
                    label: 'Go there',
                    icon: 'bi-arrow-right-circle'
                };
            }
        }

        // Pattern 3: Look for inline JSON object with action property
        const inlineJsonRegex = /\{[^{}]*"action"\s*:\s*\{[^{}]*\}[^{}]*\}/i;
        const inlineMatch = text.match(inlineJsonRegex);
        if (inlineMatch) {
            try {
                const parsed = JSON.parse(inlineMatch[0]);
                if (parsed.action) {
                    return this.normalizeAction(parsed.action);
                }
            } catch (e) {
                // Invalid JSON, ignore
            }
        }

        return undefined;
    }

    /**
     * Normalizes an action object to ensure all required fields are present.
     */
    private normalizeAction(action: any): ChatbotAction {
        const normalized: ChatbotAction = {
            type: action.type || 'navigate',
            path: action.path,
            queryParams: action.queryParams || action.params,
            elementId: action.elementId,
            label: action.label || this.getDefaultLabel(action.type, action.path),
            icon: action.icon || this.getDefaultIcon(action.type, action.path)
        };
        return normalized;
    }

    /**
     * Gets a default label based on action type and path.
     */
    private getDefaultLabel(type: string, path?: string): string {
        if (type === 'navigate' && path) {
            if (path.includes('transaction')) return 'Add transaction';
            if (path.includes('saving')) return 'Go to savings';
            if (path.includes('budget')) return 'Go to budgets';
            if (path.includes('dashboard')) return 'View dashboard';
            if (path.includes('report')) return 'View reports';
            return 'Go there';
        }
        if (type === 'scroll') return 'View section';
        return 'Take action';
    }

    /**
     * Gets a default icon based on action type and path.
     */
    private getDefaultIcon(type: string, path?: string): string {
        if (type === 'navigate' && path) {
            if (path.includes('transaction')) return 'bi-plus-circle';
            if (path.includes('saving')) return 'bi-piggy-bank';
            if (path.includes('budget')) return 'bi-wallet2';
            if (path.includes('dashboard')) return 'bi-grid';
            if (path.includes('report')) return 'bi-bar-chart';
            return 'bi-arrow-right-circle';
        }
        if (type === 'scroll') return 'bi-arrow-down-circle';
        return 'bi-lightning';
    }

    /**
     * Parses query string from a path like '/transactions?amount=500&category=Food'
     */
    private parseQueryString(path: string): Record<string, string | number> {
        const params: Record<string, string | number> = {};
        const queryStart = path.indexOf('?');
        if (queryStart === -1) return params;

        const queryString = path.substring(queryStart + 1);
        const pairs = queryString.split('&');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key && value) {
                const decodedValue = decodeURIComponent(value);
                // Try to parse as number
                const numValue = parseFloat(decodedValue);
                params[key] = isNaN(numValue) ? decodedValue : numValue;
            }
        }
        return params;
    }

    /**
     * Removes JSON blocks and action markers from text for cleaner display.
     */
    private removeJsonFromText(text: string): string {
        // Remove ```json ... ``` blocks
        text = text.replace(/```json\s*\{[\s\S]*?\}\s*```/gi, '');
        // Remove [ACTION:...] markers
        text = text.replace(/\[ACTION:\w+:[^\]]+\]/gi, '');
        // Remove inline JSON objects with action
        text = text.replace(/\{[^{}]*"action"\s*:\s*\{[^{}]*\}[^{}]*\}/gi, '');
        // Clean up extra whitespace
        text = text.replace(/\n{3,}/g, '\n\n').trim();
        return text;
    }

    /**
     * Executes a chatbot action (navigation, scroll, etc.)
     */
    executeAction(action: ChatbotAction): void {
        if (!action) return;

        switch (action.type) {
            case 'navigate':
                if (action.path) {
                    // Close the sidebar before navigating
                    this.chatbotService.toggle();
                    
                    // Navigate with query params if present
                    if (action.queryParams && Object.keys(action.queryParams).length > 0) {
                        this.router.navigate([action.path], { queryParams: action.queryParams });
                    } else {
                        this.router.navigate([action.path]);
                    }
                }
                break;

            case 'scroll':
                if (action.elementId) {
                    const element = document.getElementById(action.elementId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
                break;

            case 'open-modal':
                // For now, navigate to the page - modal opening can be handled by the target component
                if (action.path) {
                    this.chatbotService.toggle();
                    this.router.navigate([action.path], { 
                        queryParams: { 
                            ...action.queryParams, 
                            openModal: 'true' 
                        } 
                    });
                }
                break;

            default:
                console.warn('Unknown action type:', action.type);
        }
    }
}
