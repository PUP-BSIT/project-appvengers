import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { Notifications } from './notifications';

describe('Notifications', () => {
  let component: Notifications;
  let fixture: ComponentFixture<Notifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
