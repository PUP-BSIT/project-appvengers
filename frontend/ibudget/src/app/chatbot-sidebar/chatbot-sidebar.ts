import { Component, signal, inject, effect, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService, ChatMessage, ChatbotAction, ChatbotResponse, ChatVisualization, RateLimitError, CHATBOT_INPUT_LIMITS } from './chatbot.service';
import { ChatChart } from './chat-chart/chat-chart';
import { SpeechService, SpeechResult, SpeechError } from '../../services/speech.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { Subscription } from 'rxjs';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-chatbot-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule, ChatChart],
    templateUrl: './chatbot-sidebar.html',
    styleUrl: './chatbot-sidebar.scss'
})
export class ChatbotSidebar implements OnInit, OnDestroy {
    private chatbotService = inject(ChatbotService);
    private speechService = inject(SpeechService);
    private sanitizer = inject(DomSanitizer);
    private router = inject(Router);
    private localStorageService = inject(LocalStorageService);

    // Subscriptions for cleanup
    private speechSubscription: Subscription | null = null;
    private errorSubscription: Subscription | null = null;
    private typewriterTimeoutId: number | null = null;

    // isOpen = signal(false); // Removed local state
    isOpen = this.chatbotService.isOpen;
    isLoading = signal(false);
    messages = signal<ChatMessage[]>([]);
    userInput = signal('');
    loadingWord = signal('Thinking...');
    lastError = signal<string | null>(null);
    showWelcome = signal(true);

    // Typewriter greeting
    userName = signal<string>('');
    typewriterText = signal<string>('');
    showTypewriter = signal<boolean>(true);

    // Speech-related signals
    isRecording = this.speechService.isListening;
    isSpeaking = this.speechService.isSpeaking;
    isSTTSupported = this.speechService.isSTTSupported;
    isTTSSupported = this.speechService.isTTSSupported;
    autoSpeak = signal(false); // Auto-read bot responses
    liveTranscript = signal(''); // Live transcript during recording
    speechError = signal<string | null>(null);

    // Voice settings
    showSettings = signal(false);
    availableVoices = this.speechService.availableVoices;
    currentVoiceName = this.speechService.currentVoiceName;

    // Copy message tracking
    copiedMessageId = signal<number | null>(null);

    // Scroll tracking
    private shouldScrollToBottom = false;

    // Track which user's messages are loaded (to detect user change)
    private loadedForUserId: number | null = null;

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
    @ViewChild('textareaRef') private textareaRef!: ElementRef<HTMLTextAreaElement>;

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

        // Save messages to localStorage whenever they change (only if userId is set)
        effect(() => {
            const msgs = this.messages();
            const userId = this.localStorageService.getUserId();
            if (msgs.length > 0 && userId !== null) {
                this.chatbotService.saveMessages(msgs);
            }
        });

        // Reload messages when sidebar opens (in case userId wasn't set on first load or user changed)
        effect(() => {
            if (this.isOpen()) {
                this.loadMessagesIfReady();
            }
        });

        // Reset local state when service state is cleared (logout)
        effect(() => {
            // Track stateVersion changes - when it changes, reset local state
            const version = this.chatbotService.stateVersion();
            if (version > 0) {
                if (!environment.production) {
                    console.log('[ChatbotSidebar] State reset triggered (version:', version, ')');
                }
                this.loadedForUserId = null;
                this.messages.set([]);
            }
        });

        // Subscribe to speech recognition results
        this.speechSubscription = this.speechService.transcript$.subscribe(
            (result: SpeechResult) => {
                // Update live transcript
                this.liveTranscript.set(result.transcript);

                // When speech recognition finalizes, append to existing input
                if (result.isFinal) {
                    const existingText = this.userInput().trim();
                    const newText = result.transcript.trim();
                    // Append with space separator if there's existing text
                    const combined = existingText
                        ? `${existingText} ${newText}`
                        : newText;
                    this.userInput.set(combined);
                    this.liveTranscript.set('');
                }
            }
        );

        // Subscribe to speech errors
        this.errorSubscription = this.speechService.error$.subscribe(
            (error: SpeechError) => {
                this.speechError.set(error.message);
                this.liveTranscript.set('');

                // Auto-clear error after 5 seconds
                setTimeout(() => this.speechError.set(null), 5000);
            }
        );
    }

    ngOnInit() {
        // Try to load persisted messages (will only work if userId is already set)
        this.loadMessagesIfReady();

        // Extract username and start typewriter animation
        this.extractUsername();
        this.startTypewriterAnimation();
    }

    /**
     * Load messages from localStorage if userId is available.
     * Called on init and when sidebar opens.
     */
    private loadMessagesIfReady(): void {
        const userId = this.localStorageService.getUserId();

        if (userId === null) {
            if (!environment.production) {
                console.log('[ChatbotSidebar] userId not set yet, will retry when sidebar opens');
            }
            // DON'T add welcome message here - wait for userId to be set
            // This prevents overwriting saved messages when effect triggers
            return;
        }

        // Check if we already loaded for this user
        if (this.loadedForUserId === userId) {
            if (!environment.production) {
                console.log('[ChatbotSidebar] Messages already loaded for user', userId);
            }
            return;
        }

        // Reload voices to load this user's saved voice preference
        this.speechService.reloadVoices();

        if (!environment.production) {
            console.log('[ChatbotSidebar] Loading messages for user', userId);
        }
        const savedMessages = this.chatbotService.loadMessages();
        if (savedMessages.length > 0) {
            this.messages.set(savedMessages);
            this.showWelcome.set(false);
            if (!environment.production) {
                console.log('[ChatbotSidebar] Loaded', savedMessages.length, 'messages from storage');
            }
        } else {
            // Show welcome message for new sessions (no saved history)
            if (!environment.production) {
                console.log('[ChatbotSidebar] No saved messages, showing welcome');
            }
            this.addWelcomeMessage();
        }

        // Load auto-speak preference from user-scoped localStorage
        const savedAutoSpeak = this.localStorageService.getItem<boolean>('bonzi_autoSpeak');
        if (savedAutoSpeak === true) {
            this.autoSpeak.set(true);
        } else {
            this.autoSpeak.set(false);
        }

        this.loadedForUserId = userId;
    }

    ngOnDestroy() {
        // Cleanup subscriptions
        if (this.speechSubscription) {
            this.speechSubscription.unsubscribe();
        }
        if (this.errorSubscription) {
            this.errorSubscription.unsubscribe();
        }

        // Stop typewriter animation
        this.stopTypewriterAnimation();

        // Stop any ongoing speech
        this.speechService.stopListening();
        this.speechService.stopSpeaking();
    }

    private addWelcomeMessage() {
        // No longer adding a constant welcome message
        // Greeting is now displayed via typewriter effect in the empty state
        this.showWelcome.set(false);
    }

    /**
     * Check if user is near the bottom of the scroll container.
     * Returns true if within 100px of the bottom.
     */
    private isNearBottom(): boolean {
        if (!this.scrollContainer?.nativeElement) return true;

        const el = this.scrollContainer.nativeElement;
        const threshold = 100; // pixels from bottom
        return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }

    /**
     * Scroll to bottom with smooth animation.
     * Only call this when appropriate (new message, user sent message).
     */
    private scrollToBottomSmooth(): void {
        setTimeout(() => {
            try {
                if (this.scrollContainer?.nativeElement) {
                    this.scrollContainer.nativeElement.scrollTo({
                        top: this.scrollContainer.nativeElement.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            } catch (err) { }
        }, 50);
    }

    toggleSidebar() {
        this.chatbotService.toggle();
    }

    sendMessage() {
        const text = this.userInput().trim();
        if (!text || this.isLoading()) return;

        // Client-side validation (matches backend limits)
        if (text.length > CHATBOT_INPUT_LIMITS.MAX_MESSAGE_LENGTH) {
            this.handleError(`Message is too long. Maximum ${CHATBOT_INPUT_LIMITS.MAX_MESSAGE_LENGTH} characters allowed.`);
            return;
        }

        this.sendMessageWithText(text);
    }

    private sendMessageWithText(text: string) {
        // Check if user is near bottom before adding message (for smart scroll)
        const wasNearBottom = this.isNearBottom();

        // Add user message
        this.messages.update(msgs => [...msgs, { text, isUser: true, timestamp: new Date() }]);
        this.userInput.set('');
        this.resetTextareaHeight(); // Reset textarea to original size
        this.isLoading.set(true);
        this.lastError.set(null);

        // Always scroll to bottom when user sends a message
        this.scrollToBottomSmooth();

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

                    // Create message with optional action and visualization
                    const botMessage: ChatMessage = {
                        text: parsed.text,
                        isUser: false,
                        timestamp: new Date(),
                        action: parsed.action,
                        visualization: parsed.visualization
                    };

                    this.messages.update(msgs => [...msgs, botMessage]);
                    this.isLoading.set(false);

                    // Only auto-scroll if user was near bottom when they sent the message
                    if (wasNearBottom) {
                        this.scrollToBottomSmooth();
                    }

                    // Auto-speak bot response if enabled
                    if (this.autoSpeak() && parsed.text) {
                        this.speakMessage(parsed.text);
                    }
                },
                error: (error) => {
                    // Extract user-friendly error message from error object
                    let errorMessage = "Sorry, I couldn't reach the server. Please try again.";

                    if (error) {
                        // Handle 429 Too Many Requests (rate limit exceeded)
                        if (error.status === 429) {
                            const rateLimitError = error.error as RateLimitError;
                            const retrySeconds = rateLimitError?.retryAfterSeconds || 60;
                            errorMessage = `⏱️ You're sending messages too quickly. Please wait ${retrySeconds} seconds before trying again.`;

                            // Auto-retry after the wait period (optional - can be disabled)
                            // setTimeout(() => this.retryLastMessage(), retrySeconds * 1000);
                        }
                        // Try to extract error message from various possible structures
                        else if (typeof error === 'string') {
                            errorMessage = error;
                        } else if (error.error) {
                            // Check for structured error response with output field
                            if (error.error.output) {
                                errorMessage = error.error.output;
                            } else {
                                errorMessage = typeof error.error === 'string'
                                    ? error.error
                                    : error.error.message || errorMessage;
                            }
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
        this.showTypewriter.set(true);
        this.startTypewriterAnimation();
        this.lastError.set(null);
    }

    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * Auto-resize textarea based on content (Claude/ChatGPT style).
     * Dynamically grows and shrinks with content.
     */
    autoResize(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';

        // Set height to scrollHeight (content height), capped at max-height via CSS
        const newHeight = Math.min(textarea.scrollHeight, 150); // 150px max
        textarea.style.height = `${newHeight}px`;
    }

    /**
     * Reset textarea height after sending message.
     */
    private resetTextareaHeight(): void {
        if (this.textareaRef?.nativeElement) {
            this.textareaRef.nativeElement.style.height = 'auto';
        }
    }

    parseMarkdown(text: string): SafeHtml {
        const rawHtml = marked.parse(text) as string;
        // Sanitize HTML to prevent XSS attacks before bypassing Angular's security
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
    }

    /**
     * Parses the chatbot response to extract text, optional action, and visualization.
     * Handles both plain text responses and structured JSON responses.
     */
    private parseResponse(response: ChatbotResponse | any): {
        text: string;
        action?: ChatbotAction;
        visualization?: ChatVisualization;
    } {
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

        // Extract visualization from response or text
        let visualization = response.visualization;
        if (!visualization && typeof text === 'string') {
            visualization = this.extractVisualizationFromText(text);
            if (visualization) {
                // Remove visualization JSON block from displayed text
                text = this.removeVisualizationFromText(text);
            }
        }

        return { text, action, visualization };
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
     * Extracts visualization data from text that may contain embedded JSON.
     * Looks for JSON blocks marked with ```json containing a visualization object.
     */
    private extractVisualizationFromText(text: string): ChatVisualization | undefined {
        // Pattern 1: Look for ```json ... ``` blocks with visualization
        const jsonBlockRegex = /```json\s*(\{[\s\S]*?"visualization"[\s\S]*?\})\s*```/i;
        const blockMatch = text.match(jsonBlockRegex);
        if (blockMatch) {
            try {
                const parsed = JSON.parse(blockMatch[1]);
                if (parsed.visualization && this.isValidVisualization(parsed.visualization)) {
                    return parsed.visualization as ChatVisualization;
                }
            } catch (e) {
                // Invalid JSON, ignore
            }
        }

        // Pattern 2: Look for standalone visualization JSON block
        const vizBlockRegex = /```json\s*(\{[\s\S]*?"type"\s*:\s*"(?:doughnut|pie|bar|line)"[\s\S]*?\})\s*```/i;
        const vizMatch = text.match(vizBlockRegex);
        if (vizMatch) {
            try {
                const parsed = JSON.parse(vizMatch[1]);
                if (this.isValidVisualization(parsed)) {
                    return parsed as ChatVisualization;
                }
            } catch (e) {
                // Invalid JSON, ignore
            }
        }

        return undefined;
    }

    /**
     * Validates that an object has the required ChatVisualization structure.
     */
    private isValidVisualization(obj: any): boolean {
        if (!obj || typeof obj !== 'object') return false;

        const validTypes = ['doughnut', 'pie', 'bar', 'line'];
        if (!validTypes.includes(obj.type)) return false;

        if (!obj.data || !Array.isArray(obj.data.labels) || !Array.isArray(obj.data.values)) {
            return false;
        }

        if (obj.data.labels.length === 0 || obj.data.values.length === 0) {
            return false;
        }

        return true;
    }

    /**
     * Removes visualization JSON blocks from text for cleaner display.
     */
    private removeVisualizationFromText(text: string): string {
        // Remove ```json ... ``` blocks containing visualization
        text = text.replace(/```json\s*\{[\s\S]*?"visualization"[\s\S]*?\}\s*```/gi, '');
        // Remove standalone visualization blocks
        text = text.replace(/```json\s*\{[\s\S]*?"type"\s*:\s*"(?:doughnut|pie|bar|line)"[\s\S]*?\}\s*```/gi, '');
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

    // ==================== Speech Methods ====================

    /**
     * Toggle voice recording on/off.
     * Starts/stops speech recognition.
     */
    toggleRecording(): void {
        if (!this.isSTTSupported()) {
            this.speechError.set('Speech recognition is not supported in your browser. Try Chrome or Edge.');
            setTimeout(() => this.speechError.set(null), 5000);
            return;
        }

        this.speechError.set(null);

        if (this.isRecording()) {
            this.speechService.stopListening();
            this.liveTranscript.set('');
        } else {
            this.speechService.startListening();
        }
    }

    /**
     * Toggle auto-speak feature for bot responses.
     */
    toggleAutoSpeak(): void {
        if (!this.isTTSSupported()) {
            this.speechError.set('Text-to-speech is not supported in your browser.');
            setTimeout(() => this.speechError.set(null), 5000);
            return;
        }

        const newValue = !this.autoSpeak();
        this.autoSpeak.set(newValue);

        // Persist preference to user-scoped localStorage
        this.localStorageService.setItem('bonzi_autoSpeak', newValue);

        // Stop any ongoing speech when turning off
        if (!newValue && this.isSpeaking()) {
            this.speechService.stopSpeaking();
        }
    }

    /**
     * Speak a message aloud using TTS.
     * @param text The text to speak
     */
    speakMessage(text: string): void {
        if (!this.isTTSSupported()) {
            return;
        }

        // If already speaking the same message, stop it
        if (this.isSpeaking()) {
            this.speechService.stopSpeaking();
        } else {
            this.speechService.speak(text);
        }
    }

    /**
     * Stop any ongoing speech.
     */
    stopSpeaking(): void {
        this.speechService.stopSpeaking();
    }

    // ==================== Copy Methods ====================

    /**
     * Copy message text to clipboard.
     * Shows visual feedback when copied.
     * @param msg The message to copy
     */
    async copyMessage(msg: ChatMessage): Promise<void> {
        try {
            // Strip markdown formatting for cleaner clipboard content
            const cleanText = this.stripMarkdown(msg.text);
            await navigator.clipboard.writeText(cleanText);

            // Show copied feedback using message timestamp as ID
            const msgId = msg.timestamp.getTime();
            this.copiedMessageId.set(msgId);

            // Reset after 2 seconds
            setTimeout(() => {
                if (this.copiedMessageId() === msgId) {
                    this.copiedMessageId.set(null);
                }
            }, 2000);
        } catch (error) {
            console.error('Failed to copy message:', error);
            // Fallback for older browsers
            this.fallbackCopyToClipboard(msg);
        }
    }

    /**
     * Strip markdown formatting from text for cleaner clipboard content.
     */
    private stripMarkdown(text: string): string {
        return text
            // Remove bold/italic markers
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/_([^_]+)_/g, '$1')
            // Remove inline code
            .replace(/`([^`]+)`/g, '$1')
            // Remove headers
            .replace(/^#{1,6}\s+/gm, '')
            // Remove link markdown but keep text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Clean up extra whitespace
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    /**
     * Fallback copy method for older browsers.
     */
    private fallbackCopyToClipboard(msg: ChatMessage): void {
        const textArea = document.createElement('textarea');
        textArea.value = this.stripMarkdown(msg.text);
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            const msgId = msg.timestamp.getTime();
            this.copiedMessageId.set(msgId);
            setTimeout(() => {
                if (this.copiedMessageId() === msgId) {
                    this.copiedMessageId.set(null);
                }
            }, 2000);
        } catch (error) {
            console.error('Fallback copy failed:', error);
        }

        document.body.removeChild(textArea);
    }

    // ==================== Settings Methods ====================

    /**
     * Toggle the settings panel visibility.
     */
    toggleSettings(): void {
        this.showSettings.update(v => !v);
    }

    /**
     * Select a voice by name.
     * @param voiceName The name of the voice to select
     */
    selectVoice(voiceName: string): void {
        this.speechService.setVoiceByName(voiceName);
    }

    /**
     * Preview the currently selected voice.
     */
    previewVoice(): void {
        const testText = 'Hello! This is how I will read messages. The price is ₱1,500 pesos.';
        this.speechService.speak(testText);
    }

    /**
     * Get voices grouped by language for the dropdown.
     */
    getGroupedVoices(): { lang: string; langName: string; voices: SpeechSynthesisVoice[] }[] {
        const voices = this.availableVoices();
        const grouped = new Map<string, SpeechSynthesisVoice[]>();

        // Group voices by language
        voices.forEach(voice => {
            const lang = voice.lang;
            if (!grouped.has(lang)) {
                grouped.set(lang, []);
            }
            grouped.get(lang)!.push(voice);
        });

        // Convert to array and sort, prioritizing English and Filipino
        const result: { lang: string; langName: string; voices: SpeechSynthesisVoice[] }[] = [];
        const priorityLangs = ['en-PH', 'fil-PH', 'en-US', 'en-GB', 'en-AU'];

        // Add priority languages first
        priorityLangs.forEach(lang => {
            if (grouped.has(lang)) {
                result.push({
                    lang,
                    langName: this.getLanguageName(lang),
                    voices: grouped.get(lang)!
                });
                grouped.delete(lang);
            }
        });

        // Add remaining languages sorted alphabetically
        Array.from(grouped.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([lang, voiceList]) => {
                result.push({
                    lang,
                    langName: this.getLanguageName(lang),
                    voices: voiceList
                });
            });

        return result;
    }

    /**
     * Get human-readable language name from BCP-47 code.
     */
    private getLanguageName(langCode: string): string {
        const langNames: Record<string, string> = {
            'en-PH': '🇵🇭 English (Philippines)',
            'fil-PH': '🇵🇭 Filipino',
            'en-US': '🇺🇸 English (US)',
            'en-GB': '🇬🇧 English (UK)',
            'en-AU': '🇦🇺 English (Australia)',
            'en-IN': '🇮🇳 English (India)',
            'en-CA': '🇨🇦 English (Canada)',
            'es-ES': '🇪🇸 Spanish (Spain)',
            'es-MX': '🇲🇽 Spanish (Mexico)',
            'fr-FR': '🇫🇷 French',
            'de-DE': '🇩🇪 German',
            'it-IT': '🇮🇹 Italian',
            'ja-JP': '🇯🇵 Japanese',
            'ko-KR': '🇰🇷 Korean',
            'zh-CN': '🇨🇳 Chinese (Simplified)',
            'zh-TW': '🇹🇼 Chinese (Traditional)',
            'pt-BR': '🇧🇷 Portuguese (Brazil)',
            'ru-RU': '🇷🇺 Russian',
        };
        return langNames[langCode] || langCode;
    }

    // ==================== Username & Typewriter Animation ====================

    /**
     * Extract username from localStorage
     */
    private extractUsername(): void {
        try {
            // Try to get username from localStorage first (stored during login)
            const storedUsername = localStorage.getItem('iBudget_username');

            if (storedUsername) {
                this.userName.set(storedUsername);
                return;
            }

            // Fallback to token if username not in localStorage
            const token = localStorage.getItem('iBudget_authToken');
            if (!token) {
                this.userName.set('Guest');
                return;
            }

            // Decode JWT token payload
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Extract username from token, avoiding email
            const username = payload.username || payload.name || 'Guest';

            this.userName.set(username);
        } catch (e) {
            console.error('Error extracting username:', e);
            this.userName.set('Guest');
        }
    }

    /**
     * Start typewriter animation for greeting (loops infinitely)
     */
    private startTypewriterAnimation(): void {
        const fullText = `Hi, ${this.userName()}`;
        let currentIndex = 0;
        let isDeleting = false;
        this.typewriterText.set('');

        const typeLoop = () => {
            if (!isDeleting) {
                // Typing forward
                if (currentIndex < fullText.length) {
                    this.typewriterText.set(fullText.substring(0, currentIndex + 1));
                    currentIndex++;
                    this.typewriterTimeoutId = window.setTimeout(typeLoop, 80); // 80ms delay between characters
                } else {
                    // Pause at the end before deleting
                    this.typewriterTimeoutId = window.setTimeout(() => {
                        isDeleting = true;
                        typeLoop();
                    }, 2000); // 2 second pause
                }
            } else {
                // Deleting backward
                if (currentIndex > 0) {
                    currentIndex--;
                    this.typewriterText.set(fullText.substring(0, currentIndex));
                    this.typewriterTimeoutId = window.setTimeout(typeLoop, 50); // 50ms delay when deleting (faster)
                } else {
                    // Pause before restarting
                    this.typewriterTimeoutId = window.setTimeout(() => {
                        isDeleting = false;
                        typeLoop();
                    }, 500); // 0.5 second pause
                }
            }
        };

        typeLoop();
    }

    /**
     * Stop typewriter animation (for cleanup)
     */
    private stopTypewriterAnimation(): void {
        if (this.typewriterTimeoutId !== null) {
            clearTimeout(this.typewriterTimeoutId);
            this.typewriterTimeoutId = null;
        }
    }
}
