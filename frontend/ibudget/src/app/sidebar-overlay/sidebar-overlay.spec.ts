import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarOverlay } from './sidebar-overlay';

describe('SidebarOverlay', () => {
  let component: SidebarOverlay;
  let fixture: ComponentFixture<SidebarOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
