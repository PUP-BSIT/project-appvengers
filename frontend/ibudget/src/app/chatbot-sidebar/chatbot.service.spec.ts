import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatbotService, ChatMessage } from './chatbot.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { environment } from '../../environments/environment';

describe('ChatbotService', () => {
    let service: ChatbotService;
    let httpMock: HttpTestingController;
    let localStorageService: jasmine.SpyObj<LocalStorageService>;

    // Storage mock to simulate LocalStorageService behavior
    let mockStorage: Map<string, any>;

    beforeEach(() => {
        mockStorage = new Map();

        const localStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', 
            ['getUserId', 'setUserId', 'getItem', 'setItem', 'removeItem', 'clearUserId']
        );
        // Mock userId to be set (simulates logged-in user)
        localStorageServiceSpy.getUserId.and.returnValue(1);
        localStorageServiceSpy.getItem.and.callFake((key: string) => mockStorage.get(key) ?? null);
        localStorageServiceSpy.setItem.and.callFake((key: string, value: any) => mockStorage.set(key, value));
        localStorageServiceSpy.removeItem.and.callFake((key: string) => mockStorage.delete(key));

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ChatbotService,
                { provide: LocalStorageService, useValue: localStorageServiceSpy }
            ]
        });
        service = TestBed.inject(ChatbotService);
        httpMock = TestBed.inject(HttpTestingController);
        localStorageService = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;

        // Clear mock storage before each test
        mockStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
        mockStorage.clear();
    });

    describe('Session Persistence', () => {
        it('should create the service', () => {
            expect(service).toBeTruthy();
        });

        it('should generate and persist session ID to localStorage on first creation', () => {
            // Ensure mock storage is clear before test
            mockStorage.clear();
            
            const sessionId = service.getSessionId();
            
            expect(sessionId).toBeTruthy();
            expect(sessionId).toContain('chat-');
            
            // Verify setItem was called with the session ID
            expect(localStorageService.setItem).toHaveBeenCalledWith('bonzi_session_id', sessionId);
        });

        it('should reuse existing session ID from localStorage', () => {
            const existingSessionId = 'chat-test-session-123';
            mockStorage.set('bonzi_session_id', existingSessionId);

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

            // Verify setItem was called with serialized messages
            expect(localStorageService.setItem).toHaveBeenCalledWith(
                'bonzi_chat_history',
                jasmine.arrayContaining([
                    jasmine.objectContaining({ text: 'Hello' }),
                    jasmine.objectContaining({ text: 'Hi there!' })
                ])
            );
        });

        it('should load messages from localStorage', () => {
            const testMessages = [
                { text: 'Test message', isUser: true, timestamp: new Date().toISOString() }
            ];
            mockStorage.set('bonzi_chat_history', testMessages);

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
            mockStorage.set('bonzi_chat_history', [{ text: 'test' }]);
            mockStorage.set('bonzi_session_id', 'chat-old-session');

            service.clearHistory();

            expect(localStorageService.removeItem).toHaveBeenCalledWith('bonzi_chat_history');
            expect(localStorageService.removeItem).toHaveBeenCalledWith('bonzi_session_id');
        });

        it('should handle localStorage errors gracefully when saving messages', () => {
            localStorageService.setItem.and.throwError('QuotaExceededError');
            spyOn(console, 'warn');

            const messages: ChatMessage[] = [{ text: 'test', isUser: true, timestamp: new Date() }];
            
            // Should not throw error
            expect(() => service.saveMessages(messages)).not.toThrow();
            expect(console.warn).toHaveBeenCalled();
        });

        it('should handle localStorage errors gracefully when loading messages', () => {
            localStorageService.getItem.and.throwError('SecurityError');
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
