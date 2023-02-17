import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckInBookComponent } from './check-in-book.component';

describe('CheckInBookComponent', () => {
  let component: CheckInBookComponent;
  let fixture: ComponentFixture<CheckInBookComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckInBookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
