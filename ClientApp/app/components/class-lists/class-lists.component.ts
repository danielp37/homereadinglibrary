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
  currentClass: Class;
  selectedClassId: string;
  public modalRef: BsModalRef;

  constructor(
    private baggyBookService: BaggyBookService,
    private modalService: BsModalService
  ) { }

  displayClassListForCurrentTeacher(classId: string) {
    this.selectedClassId = classId;
    this.currentClass = this.classes.find(cls => cls.classId === classId);
  }

  onNewStudent(updatedClass: Class) {
    const classIdx = this.classes.findIndex(cls => cls.classId === updatedClass.classId);
    this.classes[classIdx] = updatedClass;
    this.displayClassListForCurrentTeacher(updatedClass.classId);
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
