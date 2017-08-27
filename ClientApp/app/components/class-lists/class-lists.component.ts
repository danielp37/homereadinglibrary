import { AddClassComponent } from './../add-class/add-class.component';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Class } from '../../entities/class';
import { Student } from '../../entities/student';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-class-lists',
  templateUrl: './class-lists.component.html',
  styleUrls: ['./class-lists.component.css']
})
export class ClassListsComponent implements OnInit {
  classes: Class[];
  currentClassList: Student[];
  selectedClassId: string;
  public modalRef: BsModalRef;

  constructor(
    private baggyBookService: BaggyBookService,
    private modalService: BsModalService
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
    this.baggyBookService.getClasses()
      .then(classes => this.classes = classes);
    this.selectedClassId = '';
  }

  addNewClass(content: TemplateRef<any>) {
    this.modalRef =  this.modalService.show(content);
  }

  onClassAdded(newClass: Class) {
    this.baggyBookService.getClasses()
      .then(classes => this.classes = classes);
  }
}
