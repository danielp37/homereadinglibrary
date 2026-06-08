import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Renderer2, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { BookReservationHistoryComponent } from './book-reservation-history.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { UtcDatePipe } from '../../pipes/utc-date.pipe';

describe('BookReservationHistoryComponent', () => {
  let component: BookReservationHistoryComponent;
  let fixture: ComponentFixture<BookReservationHistoryComponent>;

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getBookCopyReservationsForBookCopy']);
    const mockRenderer2 = {
      selectRootElement: jasmine.createSpy('selectRootElement').and.returnValue({ focus: jasmine.createSpy('focus') })
    };

    TestBed.configureTestingModule({
      declarations: [ BookReservationHistoryComponent, UtcDatePipe ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService },
        { provide: Renderer2, useValue: mockRenderer2 }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookReservationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
