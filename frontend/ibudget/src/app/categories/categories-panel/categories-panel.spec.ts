import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart, registerables } from 'chart.js';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { CategoriesPanel } from './categories-panel';

describe('CategoriesPanel', () => {
  let component: CategoriesPanel;
  let fixture: ComponentFixture<CategoriesPanel>;

  beforeEach(async () => {
    Chart.register(...registerables);

    await TestBed.configureTestingModule({
      imports: [CategoriesPanel, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});