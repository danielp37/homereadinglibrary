import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Renderer2, NO_ERRORS_SCHEMA } from '@angular/core';
import { AddStudentComponent } from './add-student.component';
import { BaggyBookService } from '../../services/baggy-book.service';

describe('AddStudentComponent', () => {
  let component: AddStudentComponent;
  let fixture: ComponentFixture<AddStudentComponent>;

  beforeEach(waitForAsync(() => {
    const mockRenderer2 = {
      selectRootElement: jasmine.createSpy('selectRootElement').and.returnValue({ focus: jasmine.createSpy('focus') })
    };

    TestBed.configureTestingModule({
      declarations: [ AddStudentComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: jasmine.createSpyObj('BaggyBookService', ['addStudentToClass', 'addStudentByBarCode']) },
        { provide: Renderer2, useValue: mockRenderer2 }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
