import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import { Categories } from './categories';

describe('Categories', () => {
  let component: Categories;
  let fixture: ComponentFixture<Categories>;

  beforeEach(async () => {
    Chart.register(...registerables);
    
    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Categories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
