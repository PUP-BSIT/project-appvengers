import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesPanel } from './categories-panel';

describe('CategoriesPanel', () => {
  let component: CategoriesPanel;
  let fixture: ComponentFixture<CategoriesPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
