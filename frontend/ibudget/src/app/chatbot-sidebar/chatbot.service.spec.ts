import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatbotService, ChatMessage } from './chatbot.service';
import { environment } from '../../environments/environment';

describe('ChatbotService', () => {
    let service: ChatbotService;
    let httpMock: HttpTestingController;
    const SESSION_STORAGE_KEY = 'bonzi_session_id';
    const MESSAGES_STORAGE_KEY = 'bonzi_chat_history';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ChatbotService]
        });
        service = TestBed.inject(ChatbotService);
        httpMock = TestBed.inject(HttpTestingController);

        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    describe('Session Persistence', () => {
        it('should create the service', () => {
            expect(service).toBeTruthy();
        });

        it('should generate and persist session ID to localStorage on first creation', () => {
            // Ensure localStorage is clear before test
            localStorage.clear();
            
            const sessionId = service.getSessionId();
            
            expect(sessionId).toBeTruthy();
            expect(sessionId).toContain('chat-');
            
            const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
            expect(storedSessionId).toBe(sessionId);
        });

        it('should reuse existing session ID from localStorage', () => {
            const existingSessionId = 'chat-test-session-123';
            localStorage.clear();
            localStorage.setItem(SESSION_STORAGE_KEY, existingSessionId);

            // Call getSessionId which should return the stored value
            const retrievedSessionId = service.getSessionId();

            expect(retrievedSessionId).toBe(existingSessionId);
        });

        it('should save messages to localStorage', () => {
            const testMessages: ChatMessage[] = [
                { text: 'Hello', isUser: true, timestamp: new Date() },
                { text: 'Hi there!', isUser: false, timestamp: new Date() }
            ];

            service.saveMessages(testMessages);

            const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
            expect(stored).toBeTruthy();
            
            const parsed = JSON.parse(stored!);
            expect(parsed.length).toBe(2);
            expect(parsed[0].text).toBe('Hello');
            expect(parsed[1].text).toBe('Hi there!');
        });

        it('should load messages from localStorage', () => {
            const testMessages = [
                { text: 'Test message', isUser: true, timestamp: new Date().toISOString() }
            ];
            localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(testMessages));

            const loaded = service.loadMessages();

            expect(loaded.length).toBe(1);
            expect(loaded[0].text).toBe('Test message');
            expect(loaded[0].isUser).toBe(true);
            expect(loaded[0].timestamp).toBeInstanceOf(Date);
        });

        it('should return empty array when no messages in localStorage', () => {
            const loaded = service.loadMessages();
            expect(loaded).toEqual([]);
        });

        it('should clear history from localStorage', () => {
            localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([{ text: 'test' }]));
            localStorage.setItem(SESSION_STORAGE_KEY, 'chat-old-session');

            service.clearHistory();

            expect(localStorage.getItem(MESSAGES_STORAGE_KEY)).toBeNull();
            expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
        });

        it('should handle localStorage errors gracefully when saving messages', () => {
            spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
            spyOn(console, 'warn');

            const messages: ChatMessage[] = [{ text: 'test', isUser: true, timestamp: new Date() }];
            
            // Should not throw error
            expect(() => service.saveMessages(messages)).not.toThrow();
            expect(console.warn).toHaveBeenCalled();
        });

        it('should handle localStorage errors gracefully when loading messages', () => {
            spyOn(localStorage, 'getItem').and.throwError('SecurityError');
            spyOn(console, 'warn');

            const result = service.loadMessages();

            expect(result).toEqual([]);
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('HTTP Communication', () => {
        it('should send message with session ID to backend', () => {
            const testMessage = 'How do I add a transaction?';
            const sessionId = service.getSessionId();

            service.sendMessage(testMessage).subscribe();

            const req = httpMock.expectOne(`${environment.apiUrl}/chatbot/message`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body.message).toBe(testMessage);
            expect(req.request.body.sessionId).toBe(sessionId);

            req.flush({ output: 'Response from AI' });
        });

        it('should handle successful response from backend', () => {
            const mockResponse = { output: 'Here is how to add a transaction...' };

            service.sendMessage('test').subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/chatbot/message`);
            req.flush(mockResponse);
        });
    });

    describe('Signal State Management', () => {
        it('should toggle isOpen signal', () => {
            expect(service.isOpen()).toBe(false);
            
            service.toggle();
            expect(service.isOpen()).toBe(true);
            
            service.toggle();
            expect(service.isOpen()).toBe(false);
        });
    });
});
