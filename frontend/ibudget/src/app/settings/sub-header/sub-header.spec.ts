import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { SubHeader } from './sub-header';

describe('SubHeader', () => {
  let component: SubHeader;
  let fixture: ComponentFixture<SubHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubHeader],
      providers: [
        provideHttpClient(),
        {provide: ActivatedRoute,
          useValue: {
            snapshot: { 
              paramMap: convertToParamMap(
                {id: '1'}
              ) 
            } 
          }
        }
      ]
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
