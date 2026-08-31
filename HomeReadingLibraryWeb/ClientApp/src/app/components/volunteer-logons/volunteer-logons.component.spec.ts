/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { VolunteerLogonsComponent } from './volunteer-logons.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { SortNamePipe } from '../../pipes/sort-name.pipe';
import { SortDatePipe } from '../../pipes/sort-date.pipe';

describe('VolunteerLogonsComponent', () => {
  let component: VolunteerLogonsComponent;
  let fixture: ComponentFixture<VolunteerLogonsComponent>;

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getVolunteerLoginsSinceDate']);
    mockBaggyBookService.getVolunteerLoginsSinceDate.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [ VolunteerLogonsComponent, SortNamePipe, SortDatePipe ],
      imports: [ FormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolunteerLogonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

