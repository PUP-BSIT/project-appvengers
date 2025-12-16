import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatbotSidebar } from './chatbot-sidebar';
import { ChatbotService, ChatMessage } from './chatbot.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('ChatbotSidebar - Retry Logic', () => {
    let component: ChatbotSidebar;
    let fixture: ComponentFixture<ChatbotSidebar>;
    let chatbotService: jasmine.SpyObj<ChatbotService>;

    beforeEach(async () => {
        const chatbotServiceSpy = jasmine.createSpyObj('ChatbotService', 
            ['sendMessage', 'toggle', 'saveMessages', 'loadMessages', 'clearHistory', 'getSessionId'],
            { isOpen: signal(false) }
        );

        await TestBed.configureTestingModule({
            imports: [ChatbotSidebar],
            providers: [
                { provide: ChatbotService, useValue: chatbotServiceSpy }
            ]
        }).compileComponents();

        chatbotService = TestBed.inject(ChatbotService) as jasmine.SpyObj<ChatbotService>;
        fixture = TestBed.createComponent(ChatbotSidebar);
        component = fixture.componentInstance;
    });

    describe('Retry Logic', () => {
        it('should display error message when sendMessage fails', (done) => {
            const errorResponse = { error: 'Network error' };
            chatbotService.sendMessage.and.returnValue(throwError(() => errorResponse));
            chatbotService.loadMessages.and.returnValue([]);

            fixture.detectChanges(); // Trigger ngOnInit

            component.userInput.set('Test message');
            component.sendMessage();

            setTimeout(() => {
                const messages = component.messages();
                const lastMessage = messages[messages.length - 1];
                
                expect(lastMessage.isUser).toBe(false);
                expect(lastMessage.text).toContain("couldn't reach the server");
                expect(component.lastError()).toBeTruthy();
                done();
            }, 100);
        });

        it('should retry last user message when retryLastMessage is called', (done) => {
            chatbotService.loadMessages.and.returnValue([]);
            chatbotService.sendMessage.and.returnValue(of({ output: 'Success response' }));

            fixture.detectChanges();

            // First, send a message
            component.userInput.set('What is my budget?');
            component.sendMessage();

            setTimeout(() => {
                const messagesBeforeRetry = component.messages().length;
                
                // Simulate error on second call
                chatbotService.sendMessage.and.returnValue(throwError(() => ({ error: 'Timeout' })));
                
                // Retry the last message
                component.retryLastMessage();

                setTimeout(() => {
                    // Should have attempted to send the same message again
                    expect(chatbotService.sendMessage).toHaveBeenCalledTimes(2);
                    expect(chatbotService.sendMessage.calls.mostRecent().args[0]).toBe('What is my budget?');
                    done();
                }, 100);
            }, 100);
        });

        it('should not retry if no user messages exist', () => {
            chatbotService.loadMessages.and.returnValue([]);
            fixture.detectChanges();

            component.retryLastMessage();

            // Should not call sendMessage if no user messages
            expect(chatbotService.sendMessage).not.toHaveBeenCalled();
        });

        it('should clear lastError on successful message send', (done) => {
            chatbotService.loadMessages.and.returnValue([]);
            chatbotService.sendMessage.and.returnValue(of({ output: 'Success' }));

            fixture.detectChanges();

            // Set an error first
            component.lastError.set('Previous error');
            
            component.userInput.set('New message');
            component.sendMessage();

            setTimeout(() => {
                expect(component.lastError()).toBeNull();
                done();
            }, 100);
        });

        it('should handle empty response from backend gracefully', (done) => {
            chatbotService.loadMessages.and.returnValue([]);
            chatbotService.sendMessage.and.returnValue(of(null));

            fixture.detectChanges();

            component.userInput.set('Test');
            component.sendMessage();

            setTimeout(() => {
                const messages = component.messages();
                const lastMessage = messages[messages.length - 1];
                
                expect(lastMessage.text).toContain('empty response');
                expect(component.lastError()).toBeTruthy();
                done();
            }, 100);
        });
    });

    describe('Welcome Message', () => {
        it('should display welcome message when no saved messages exist', () => {
            chatbotService.loadMessages.and.returnValue([]);
            
            fixture.detectChanges(); // Trigger ngOnInit

            const messages = component.messages();
            expect(messages.length).toBe(1);
            expect(messages[0].isUser).toBe(false);
            expect(messages[0].text).toContain('Bonzi');
            expect(messages[0].text).toContain('AI Financial Assistant');
        });

        it('should not display welcome message when saved messages exist', () => {
            const savedMessages: ChatMessage[] = [
                { text: 'Previous message', isUser: true, timestamp: new Date() },
                { text: 'Previous response', isUser: false, timestamp: new Date() }
            ];
            chatbotService.loadMessages.and.returnValue(savedMessages);

            fixture.detectChanges();

            const messages = component.messages();
            expect(messages.length).toBe(2);
            expect(messages[0].text).toBe('Previous message');
        });
    });

    describe('Quick Actions', () => {
        it('should send quick action prompt when sendQuickAction is called', () => {
            chatbotService.loadMessages.and.returnValue([]);
            chatbotService.sendMessage.and.returnValue(of({ output: 'Response' }));

            fixture.detectChanges();

            const testPrompt = 'Show me my spending breakdown';
            component.sendQuickAction(testPrompt);

            expect(component.userInput()).toBe(testPrompt);
            expect(chatbotService.sendMessage).toHaveBeenCalledWith(testPrompt);
        });
    });

    describe('Clear Chat', () => {
        it('should clear all messages and reset to welcome state', () => {
            chatbotService.loadMessages.and.returnValue([
                { text: 'Old message', isUser: true, timestamp: new Date() }
            ]);

            fixture.detectChanges();

            component.clearChat();

            expect(chatbotService.clearHistory).toHaveBeenCalled();
            
            const messages = component.messages();
            expect(messages.length).toBe(1);
            expect(messages[0].text).toContain('Bonzi');
            expect(component.lastError()).toBeNull();
        });
    });

    describe('Input Validation', () => {
        it('should not send empty message', () => {
            chatbotService.loadMessages.and.returnValue([]);
            fixture.detectChanges();

            component.userInput.set('   '); // Only whitespace
            component.sendMessage();

            expect(chatbotService.sendMessage).not.toHaveBeenCalled();
        });

        it('should not send message while loading', (done) => {
            chatbotService.loadMessages.and.returnValue([]);
            chatbotService.sendMessage.and.returnValue(of({ output: 'Response' }));

            fixture.detectChanges();

            component.userInput.set('First message');
            component.sendMessage();

            // Try to send another message immediately (while loading)
            component.userInput.set('Second message');
            component.sendMessage();

            setTimeout(() => {
                // Should only have been called once
                expect(chatbotService.sendMessage).toHaveBeenCalledTimes(1);
                done();
            }, 100);
        });

        it('should clear user input after successful send', (done) => {
            chatbotService.loadMessages.and.returnValue([]);
            chatbotService.sendMessage.and.returnValue(of({ output: 'Response' }));

            fixture.detectChanges();

            component.userInput.set('Test message');
            component.sendMessage();

            setTimeout(() => {
                expect(component.userInput()).toBe('');
                done();
            }, 100);
        });
    });

    describe('Message Persistence', () => {
        it('should save messages to service after sending', (done) => {
            chatbotService.loadMessages.and.returnValue([]);
            chatbotService.sendMessage.and.returnValue(of({ output: 'AI response' }));
            chatbotService.saveMessages.and.stub();

            fixture.detectChanges();

            component.userInput.set('Test');
            component.sendMessage();

            setTimeout(() => {
                // Effect should have triggered saveMessages
                expect(chatbotService.saveMessages).toHaveBeenCalled();
                done();
            }, 100);
        });
    });
});
