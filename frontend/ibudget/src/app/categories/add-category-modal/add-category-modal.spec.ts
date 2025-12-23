import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategoryModal } from './add-category-modal';

describe('AddCategoryModal', () => {
  let component: AddCategoryModal;
  let fixture: ComponentFixture<AddCategoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCategoryModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCategoryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
