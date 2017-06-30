import { Component, OnInit } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Class } from '../../entities/class';
import { Student } from '../../entities/student';

@Component({
  selector: 'app-class-lists',
  templateUrl: './class-lists.component.html',
  styleUrls: ['./class-lists.component.css']
})
export class ClassListsComponent implements OnInit {
  classes: Class[];
  currentClassList: Student[];
  selectedClassId: string;

  constructor(
    private baggyBookService: BaggyBookService
  ) { }

  displayClassListForCurrentTeacher(classId: string) {
    this.selectedClassId = classId;
    this.currentClassList = undefined;
    this.updateCurrentClassList();
  }

  updateCurrentClassList() {
    this.baggyBookService.getStudents(this.selectedClassId)
      .then(students => this.currentClassList = students);
  }

  onNewStudent(newStudent: Student) {
    this.updateCurrentClassList();
  }

  ngOnInit() {
    this.baggyBookService.getClasses(2018)
      .then(classes => this.classes = classes);
    this.selectedClassId = '';
  }

}
