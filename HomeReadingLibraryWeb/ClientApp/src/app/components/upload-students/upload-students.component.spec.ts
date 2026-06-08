import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UploadStudentsComponent } from './upload-students.component';
import { BaggyBookService } from '../../services/baggy-book.service';

describe('UploadStudentsComponent', () => {
  let component: UploadStudentsComponent;
  let fixture: ComponentFixture<UploadStudentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadStudentsComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: jasmine.createSpyObj('BaggyBookService', ['uploadStudents']) }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
