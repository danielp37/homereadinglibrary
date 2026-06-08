/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Renderer2, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { CheckOutBookComponent } from './check-out-book.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SortClassPipe } from '../../pipes/sort-class.pipe';

describe('CheckOutBookComponent', () => {
  let component: CheckOutBookComponent;
  let fixture: ComponentFixture<CheckOutBookComponent>;

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getClasses']);
    mockBaggyBookService.getClasses.and.returnValue(of([]));
    const mockRenderer2 = {
      selectRootElement: jasmine.createSpy('selectRootElement').and.returnValue({ focus: jasmine.createSpy('focus') })
    };

    TestBed.configureTestingModule({
      declarations: [ CheckOutBookComponent, SortClassPipe ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService },
        { provide: BsModalService, useValue: jasmine.createSpyObj('BsModalService', ['show']) },
        { provide: Renderer2, useValue: mockRenderer2 }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckOutBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
