import { Component, OnInit, TemplateRef } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Class } from '../../entities/class';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-class-lists',
  templateUrl: './class-lists.component.html',
  styleUrls: ['./class-lists.component.css']
})
export class ClassListsComponent implements OnInit {
  classes: Class[];
  currentClass: Class;
  selectedClassId: string;
  public modalRef: BsModalRef;

  columns = [
    { prop: 'firstName', name: "First Name"},
    { prop: 'lastName', name: "Last Name"},
    { prop: 'barCode', name: "Bar Code"}
  ];

  constructor(
    private baggyBookService: BaggyBookService,
    private modalService: BsModalService
  ) { }

  displayClassListForCurrentTeacher() {
    this.currentClass = this.classes.find(cls => cls.classId === this.selectedClassId);
  }

  onNewStudent(updatedClass: Class) {
    const classIdx = this.classes.findIndex(cls => cls.classId === updatedClass.classId);
    this.classes[classIdx] = updatedClass;
    this.displayClassListForCurrentTeacher();
  }

  ngOnInit() {
    this.baggyBookService.getClasses()
      .then(classes => this.classes = classes);
    this.selectedClassId = '';
  }

  addNewClass(content: TemplateRef<any>) {
    this.modalRef =  this.modalService.show(content);
  }

  addMultipleStudents(content: TemplateRef<any>) {
    this.modalRef = this.modalService.show(content);
  }

  onClassAdded(newClass: Class) {
    this.baggyBookService.getClasses()
      .then(classes => {
        this.classes = classes;

      });
  }
}
