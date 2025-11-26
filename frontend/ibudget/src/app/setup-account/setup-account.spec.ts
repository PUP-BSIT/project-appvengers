import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetupAccount } from './setup-account';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('SetupAccount', () => {
  let component: SetupAccount;
  let fixture: ComponentFixture<SetupAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupAccount],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            // component subscribes to queryParams
            queryParams: of({}), 
            queryParamMap: of(convertToParamMap({})),
            // optional snapshot
            snapshot: { queryParams: {} }
          }
        }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
