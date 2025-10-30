import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryTable } from './history-table';

describe('HistoryTable', () => {
  let component: HistoryTable;
  let fixture: ComponentFixture<HistoryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
