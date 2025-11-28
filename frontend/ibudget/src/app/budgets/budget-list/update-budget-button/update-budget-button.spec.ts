import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { UpdateBudgetButton } from './update-budget-button';

describe('UpdateBudgetButton', () => {
  let component: UpdateBudgetButton;
  let fixture: ComponentFixture<UpdateBudgetButton>;

  const activatedRouteStub = {
    paramMap: of(new Map<string, string>([['id', '1']])),
    snapshot: { paramMap: new Map<string, string>([['id', '1']]) }
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBudgetButton],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBudgetButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
