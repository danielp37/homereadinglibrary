import { Class } from './../../entities/class';
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
  @Output()onSaved = new EventEmitter<Class>();

  constructor(
    private fb: FormBuilder,
    private baggyBookService: BaggyBookService,
    private renderer: Renderer2
    ) {
        this.addStudentForm = this.fb.group({
          firstName : ['', Validators.required],
          lastName : ['', Validators.required]
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
    this.baggyBookService.addStudent(this.classId, newStudent)
      .then(cls => {
        this.addStudentForm.reset();
        this.focusFirstName();
        this.onSaved.emit(cls);
      });
  }

  prepareNewStudent(): Student {
    const formModel = this.addStudentForm.value;

    const newStudent: Student = {
      firstName : formModel.firstName,
      lastName : formModel.lastName,
    };

    return newStudent;
  }
}
