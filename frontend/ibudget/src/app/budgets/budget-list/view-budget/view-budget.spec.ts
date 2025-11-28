import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ViewBudget } from './view-budget';

describe('ViewBudget', () => {
  let component: ViewBudget;
  let fixture: ComponentFixture<ViewBudget>;

  const activatedRouteStub = {
    paramMap: of(new Map<string, string>([['id', '1']])),
    snapshot: { paramMap: new Map<string, string>([['id', '1']]) }
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBudget, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        provideRouter([]) // optional if router directives are used
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBudget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
