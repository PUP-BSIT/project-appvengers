import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { UpdateSaving } from './update-saving';
import { provideHttpClient } from '@angular/common/http';

describe('UpdateSaving', () => {
  let component: UpdateSaving;
  let fixture: ComponentFixture<UpdateSaving>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSaving],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSaving);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
