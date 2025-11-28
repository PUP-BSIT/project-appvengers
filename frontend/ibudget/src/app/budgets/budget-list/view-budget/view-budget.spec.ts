import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBudget } from './view-budget';

describe('ViewBudget', () => {
  let component: ViewBudget;
  let fixture: ComponentFixture<ViewBudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBudget]
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
