import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninVolunteerComponent } from './signin-volunteer.component';

describe('SigninVolunteerComponent', () => {
  let component: SigninVolunteerComponent;
  let fixture: ComponentFixture<SigninVolunteerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigninVolunteerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninVolunteerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
