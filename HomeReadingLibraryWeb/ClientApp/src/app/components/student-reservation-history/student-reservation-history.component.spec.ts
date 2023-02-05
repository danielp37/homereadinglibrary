import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StudentReservationHistoryComponent } from './student-reservation-history.component';

describe('StudentReservationHistoryComponent', () => {
  let component: StudentReservationHistoryComponent;
  let fixture: ComponentFixture<StudentReservationHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentReservationHistoryComponent ]
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
