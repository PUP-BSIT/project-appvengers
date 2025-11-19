import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSaving } from './view-saving';

describe('ViewSaving', () => {
  let component: ViewSaving;
  let fixture: ComponentFixture<ViewSaving>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSaving]
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
