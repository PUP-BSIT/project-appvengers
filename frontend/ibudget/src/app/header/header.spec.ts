import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { Header } from './header';
import { ChatbotService } from '../chatbot-sidebar/chatbot.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let chatbotService: jasmine.SpyObj<ChatbotService>;

  beforeEach(async () => {
    // Create a mock ChatbotService with a signal for isOpen
    const chatbotServiceMock = {
      toggle: jasmine.createSpy('toggle'),
      isOpen: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideCharts(withDefaultRegisterables()),
        { provide: ChatbotService, useValue: chatbotServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    chatbotService = TestBed.inject(ChatbotService) as jasmine.SpyObj<ChatbotService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call chatbotService.toggle() when toggleChatbot is called', () => {
    component.toggleChatbot();
    expect(chatbotService.toggle).toHaveBeenCalled();
  });

  it('should display the "Ask Bonzi" button', () => {
    const button = fixture.debugElement.query(By.css('.chatbot-btn'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('Ask Bonzi');
  });

  it('should call toggleChatbot when the button is clicked', () => {
    spyOn(component, 'toggleChatbot');
    const button = fixture.debugElement.query(By.css('.chatbot-btn'));
    button.triggerEventHandler('click', null);
    expect(component.toggleChatbot).toHaveBeenCalled();
  });
});

