import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { StudentReservationHistoryComponent } from './student-reservation-history.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { SortClassPipe } from '../../pipes/sort-class.pipe';
import { SortNamePipe } from '../../pipes/sort-name.pipe';
import { UtcDatePipe } from '../../pipes/utc-date.pipe';

describe('StudentReservationHistoryComponent', () => {
  let component: StudentReservationHistoryComponent;
  let fixture: ComponentFixture<StudentReservationHistoryComponent>;

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getClasses']);
    mockBaggyBookService.getClasses.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [ StudentReservationHistoryComponent, SortClassPipe, SortNamePipe, UtcDatePipe ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentReservationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
