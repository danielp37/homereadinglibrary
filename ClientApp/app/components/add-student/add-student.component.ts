import {BaggyBookService} from '../../services/baggy-book.service';
import { Component, OnInit, Input, EventEmitter, Output, ViewChild, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Student } from '../../entities/student';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css']
})
export class AddStudentComponent implements OnInit {
    addStudentForm: FormGroup;

  @Input()classId: string;
  @Output()onSaved = new EventEmitter<Student>();

  constructor(
    private fb: FormBuilder,
    private baggyBookService: BaggyBookService,
    private renderer: Renderer2
    ) {
        this.addStudentForm = this.fb.group({
          firstName : ['', Validators.required],
          lastName : ['', Validators.required],
          readingLevel : ['A', Validators.required]
        });
     }

  ngOnInit() {

    this.focusFirstName();
  }

  focusFirstName() {
    const firstNameInput = this.renderer.selectRootElement('#firstName');
    firstNameInput.focus();
  }

  onSubmit() {
    const newStudent = this.prepareNewStudent();
    this.baggyBookService.addStudent(newStudent)
      .then(ns => {
        this.addStudentForm.reset({readingLevel: 'A'});
        this.focusFirstName();
        this.onSaved.emit(ns);
      });
  }

  prepareNewStudent(): Student {
    const formModel = this.addStudentForm.value;

    const newStudent: Student = {
      studentId : null,
      firstName : formModel.firstName,
      lastName : formModel.lastName,
      readingLevel : formModel.readingLevel,
      classId : this.classId
    };

    return newStudent;
  }
}
