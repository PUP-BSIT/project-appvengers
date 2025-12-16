import { Component, signal, inject, effect, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from './chatbot.service';
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
            .pipe(
                finalize(() => this.isLoading.set(false))
            )
            .subscribe({
                next: (response: any) => {
                    // Handle null/undefined response
                    if (!response) {
                        this.handleError("Sorry, I received an empty response. Please try again.");
                        return;
                    }
                    // Extract bot response from various possible response structures
                    const botResponse = response.output || response.text || response.message || response.response || 
                                       (typeof response === 'string' ? response : JSON.stringify(response));
                    this.messages.update(msgs => [...msgs, { text: botResponse, isUser: false, timestamp: new Date() }]);
                },
                error: (error) => {
                    console.error('Chatbot error:', error);
                    this.handleError("Sorry, I couldn't reach the server. Please check your connection and try again.");
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
}
