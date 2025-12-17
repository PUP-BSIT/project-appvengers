import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleableSidebar } from './toggleable-sidebar';

describe('ToggleableSidebar', () => {
  let component: ToggleableSidebar;
  let fixture: ComponentFixture<ToggleableSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleableSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToggleableSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
