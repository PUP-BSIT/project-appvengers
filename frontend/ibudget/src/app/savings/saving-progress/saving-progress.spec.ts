import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProgress } from './saving-progress';

describe('SavingProgress', () => {
  let component: SavingProgress;
  let fixture: ComponentFixture<SavingProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingProgress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingProgress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
