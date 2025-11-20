import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ViewSaving } from './view-saving';

describe('ViewSaving', () => {
  let component: ViewSaving;
  let fixture: ComponentFixture<ViewSaving>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSaving],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSaving);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
