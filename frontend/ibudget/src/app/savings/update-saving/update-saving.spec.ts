import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSaving } from './update-saving';

describe('UpdateSaving', () => {
  let component: UpdateSaving;
  let fixture: ComponentFixture<UpdateSaving>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSaving]
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
