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
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService',     ['getBookCopyReservations', 'getLateNoticeTemplates', 'importLateNoticeTemplates']);
    mockBaggyBookService.getBookCopyReservations.and.returnValue(of({ reservations: [], count: 0 }));
        mockBaggyBookService.getLateNoticeTemplates.and.returnValue(of([{ id: 't1', name: 'Stored', content: 'c' }]));

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

  it('builds notices for reservations whose student was removed', () => {
    const reservations = [{
      id: 'r1',
      student: null,
      studentBarCode: 'S9',
      bookCopy: { title: 'Book', bookCopyBarCode: 'B1' },
      checkedOutDate: new Date('2026-01-05T00:00:00Z')
    }] as never;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => (component as any).buildNotices(reservations, 'x')).not.toThrow();
    expect(component.noticePages.length).toBe(1);
  });

  it('loads notice templates from the database on init', () => {
    expect(component.templates.map(t => t.id)).toEqual(['t1']);
    expect(component.selectedTemplateId).toBe('t1');
  });
});