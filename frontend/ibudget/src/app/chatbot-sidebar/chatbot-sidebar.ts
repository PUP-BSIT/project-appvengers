import { Component, signal, inject, effect, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from './chatbot.service';
import { finalize } from 'rxjs/operators';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ChatMessage {
    text: string;
    isUser: boolean;
    timestamp: Date;
}

@Component({
    selector: 'app-chatbot-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chatbot-sidebar.html',
    styleUrl: './chatbot-sidebar.scss'
})
export class ChatbotSidebar implements AfterViewChecked {
    private chatbotService = inject(ChatbotService);
    private sanitizer = inject(DomSanitizer);

    // isOpen = signal(false); // Removed local state
    isOpen = this.chatbotService.isOpen;
    isLoading = signal(false);
    messages = signal<ChatMessage[]>([]);
    userInput = signal('');
    loadingWord = signal('Thinking...');

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    private readonly funWords = [
        'Thinking...', 'Processing...', 'Analyzing...', 'Computing...',
        'Brainstorming...', 'Consulting the oracle...', 'Doing math...',
        'Connecting dots...', 'Loading wisdom...', 'Asking the stars...'
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

        // Add user message
        this.messages.update(msgs => [...msgs, { text, isUser: true, timestamp: new Date() }]);
        this.userInput.set('');
        this.isLoading.set(true);

        this.chatbotService.sendMessage(text)
            .pipe(
                finalize(() => this.isLoading.set(false))
            )
            .subscribe({
                next: (response: any) => {
                    // Assuming response has a 'output' or 'text' field, adjust based on actual webhook response
                    const botResponse = response.output || response.text || response.message || JSON.stringify(response);
                    this.messages.update(msgs => [...msgs, { text: botResponse, isUser: false, timestamp: new Date() }]);
                },
                error: (error) => {
                    console.error('Chatbot error:', error);
                    this.messages.update(msgs => [...msgs, { text: "Sorry, I couldn't reach the server.", isUser: false, timestamp: new Date() }]);
                }
            });
    }

    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    parseMarkdown(text: string): SafeHtml {
        const html = marked.parse(text) as string;
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
