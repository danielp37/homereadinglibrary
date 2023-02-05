import { Class } from './../../entities/class';
import {BaggyBookService} from '../../services/baggy-book.service';
import { Component, OnInit, Input, EventEmitter, Output, Renderer2 } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Student } from '../../entities/student';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css']
})
export class AddStudentComponent implements OnInit {
    addStudentForm: UntypedFormGroup;

  @Input()classId: string;
  @Input()allowBarCodeEntry: boolean;
  @Output()saved = new EventEmitter<Class>();

  errorMessage: string;

  constructor(
    private fb: UntypedFormBuilder,
    private baggyBookService: BaggyBookService,
    private renderer: Renderer2
    ) {
        this.addStudentForm = this.fb.group({
          firstName : ['', Validators.required],
          lastName : ['', Validators.required],
          barCode : ['', this.allowBarCodeEntry ? Validators.required : Validators.nullValidator]
        });
     }

  ngOnInit() {
    if (!this.allowBarCodeEntry) {
      this.focusFirstName();
    }
    this.errorMessage = '';
  }

  focusFirstName() {
    const firstNameInput = this.renderer.selectRootElement('#firstName');
    firstNameInput.focus();
  }


  onBarCodeEntered() {
    this.focusFirstName();
  }

  onSubmit() {
    this.errorMessage = '';
    const newStudent = this.prepareNewStudent();
    if (this.allowBarCodeEntry) {
      this.baggyBookService.addNewStudent(this.classId, newStudent)
        .then(cls => {
          this.addStudentForm.reset();
          this.saved.emit(cls);
        })
        .catch(err => this.errorMessage = this.processError(err));
    } else {
      this.baggyBookService.addStudent(this.classId, newStudent)
        .subscribe({ 
            next: cls => {
              this.addStudentForm.reset();
              this.focusFirstName();
              this.saved.emit(cls);
            },
            error: err => this.errorMessage = this.processError(err)
          }
        );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processError(error: any): string {
    let errorText = 'Error adding new student:\n';
    if (error._body) {
      const errorBody = JSON.parse(error._body);
      for (const prop in errorBody) {
        if (Object.prototype.hasOwnProperty.call(errorBody, prop)) {
          errorText += `${prop}: ${errorBody[prop]}\n`
        }
      }
    } else {
      errorText += error;
    }
    return errorText;
  }

  prepareNewStudent(): Student {
    const formModel = this.addStudentForm.value;

    const newStudent: Student = {
      firstName : formModel.firstName,
      lastName : formModel.lastName,
    };
    if (this.allowBarCodeEntry) {
      newStudent.barCode = formModel.barCode;
    }

    return newStudent;
  }
}
