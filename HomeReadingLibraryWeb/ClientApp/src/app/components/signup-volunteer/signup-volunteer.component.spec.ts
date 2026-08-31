import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { SignupVolunteerComponent } from './signup-volunteer.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Router } from '@angular/router';
import { SortClassPipe } from '../../pipes/sort-class.pipe';

describe('SignupVolunteerComponent', () => {
  let component: SignupVolunteerComponent;
  let fixture: ComponentFixture<SignupVolunteerComponent>;

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getClasses', 'createVolunteer']);
    mockBaggyBookService.getClasses.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [ SignupVolunteerComponent, SortClassPipe ],
      imports: [ FormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });

    // Override the component-level providers so the module-level mock is used.
    TestBed.overrideComponent(SignupVolunteerComponent, {
      set: { providers: [] }
    });

    return TestBed.compileComponents();
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
