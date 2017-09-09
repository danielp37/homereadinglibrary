import { Student } from './../../entities/student';
import { Class } from './../../entities/class';
import { BaggyBookService } from './../../services/baggy-book.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-upload-students',
  templateUrl: './upload-students.component.html',
  styleUrls: ['./upload-students.component.css']
})
export class UploadStudentsComponent implements OnInit {
  addMultipleStudentsForm: FormGroup;
  @Input()classId: string;
  @Output()onSaved = new EventEmitter<Class>();
  lastClassUpdated: Class;
  results: string[];

  constructor(
    private fb: FormBuilder,
    private baggyBookService: BaggyBookService) {
      this.addMultipleStudentsForm = this.fb.group({
        students : ['', Validators.required]
      });
      this.results = [];
     }

  ngOnInit() {
  }

  onSubmit() {
    const students = this.addMultipleStudentsForm.value.students;
    const regex = /^(.+),(?: )?(.+)$/gm
    this.addStudent(regex, students);
  }

  addStudent(regex: RegExp, students: string) {
    const match = regex.exec(students);
    if (match) {
      const newStudent: Student = {
        firstName : match[2],
        lastName : match[1],
      };
      this.baggyBookService.addStudent(this.classId, newStudent)
      .then(cls => {
        this.lastClassUpdated = cls;
        this.results.push(`${newStudent.firstName} ${newStudent.lastName} added!`);
        this.addStudent(regex, students);
      })
      .catch(error => {
        this.results.push(`${newStudent.firstName} ${newStudent.lastName} error: ${error._body || error}`)
      });
    } else {
      this.onSaved.emit(this.lastClassUpdated);
    }
  }
}
