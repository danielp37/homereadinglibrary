import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BookCopyReservationsComponent } from './book-copy-reservations.component';

describe('BookCopyReservationsComponent', () => {
  let component: BookCopyReservationsComponent;
  let fixture: ComponentFixture<BookCopyReservationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BookCopyReservationsComponent ]
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