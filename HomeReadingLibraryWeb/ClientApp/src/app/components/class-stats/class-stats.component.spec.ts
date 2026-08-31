import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ClassStatsComponent } from './class-stats.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { SortClassPipe } from '../../pipes/sort-class.pipe';
import { UtcDatePipe } from '../../pipes/utc-date.pipe';

describe('ClassStatsComponent', () => {
  let component: ClassStatsComponent;
  let fixture: ComponentFixture<ClassStatsComponent>;

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getClasses']);
    mockBaggyBookService.getClasses.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [ ClassStatsComponent, SortClassPipe, UtcDatePipe ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
