import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BookReservationHistoryComponent } from './book-reservation-history.component';

describe('BookReservationHistoryComponent', () => {
  let component: BookReservationHistoryComponent;
  let fixture: ComponentFixture<BookReservationHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BookReservationHistoryComponent ]
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
