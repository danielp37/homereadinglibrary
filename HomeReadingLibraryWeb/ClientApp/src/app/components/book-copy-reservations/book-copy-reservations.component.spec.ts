import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { BookCopyReservationsComponent } from './book-copy-reservations.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { UtcDatePipe } from '../../pipes/utc-date.pipe';
import { FormsModule } from '@angular/forms';

describe('BookCopyReservationsComponent', () => {
  let component: BookCopyReservationsComponent;
  let fixture: ComponentFixture<BookCopyReservationsComponent>;

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getBookCopyReservations']);
    mockBaggyBookService.getBookCopyReservations.and.returnValue(of({ reservations: [], count: 0 }));

    TestBed.configureTestingModule({
      declarations: [ BookCopyReservationsComponent, UtcDatePipe ],
      imports: [ FormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService },
        { provide: BsModalService, useValue: jasmine.createSpyObj('BsModalService', ['show']) }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCopyReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});