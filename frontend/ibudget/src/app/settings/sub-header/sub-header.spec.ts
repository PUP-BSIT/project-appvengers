import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubHeader } from './sub-header';

describe('SubHeader', () => {
  let component: SubHeader;
  let fixture: ComponentFixture<SubHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
