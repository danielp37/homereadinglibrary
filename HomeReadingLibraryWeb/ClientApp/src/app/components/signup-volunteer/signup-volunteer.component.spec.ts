import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SignupVolunteerComponent } from './signup-volunteer.component';

describe('SignupVolunteerComponent', () => {
  let component: SignupVolunteerComponent;
  let fixture: ComponentFixture<SignupVolunteerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupVolunteerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupVolunteerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
