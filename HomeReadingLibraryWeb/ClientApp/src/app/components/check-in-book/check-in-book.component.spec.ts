import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Renderer2, NO_ERRORS_SCHEMA } from '@angular/core';
import { CheckInBookComponent } from './check-in-book.component';
import { BaggyBookService } from '../../services/baggy-book.service';

describe('CheckInBookComponent', () => {
  let component: CheckInBookComponent;
  let fixture: ComponentFixture<CheckInBookComponent>;

  beforeEach(waitForAsync(() => {
    const mockRenderer2 = {
      selectRootElement: jasmine.createSpy('selectRootElement').and.returnValue({ focus: jasmine.createSpy('focus') })
    };

    TestBed.configureTestingModule({
      declarations: [ CheckInBookComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: jasmine.createSpyObj('BaggyBookService', ['checkInBook', 'getBookCopyByBarCode']) },
        { provide: Renderer2, useValue: mockRenderer2 }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
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
