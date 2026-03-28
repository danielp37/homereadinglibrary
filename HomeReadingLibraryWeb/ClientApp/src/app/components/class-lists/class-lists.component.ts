import { ChangeDetectorRef, Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Class } from '../../entities/class';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
    standalone: false,
  selector: 'app-class-lists',
  templateUrl: './class-lists.component.html',
  styleUrls: ['./class-lists.component.css']
})
export class ClassListsComponent implements OnInit {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
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
    private modalService: BsModalService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  displayClassListForCurrentTeacher() {
    if (!this.classes) {
      this.currentClass = undefined;
      return;
    }

    const cls = this.classes.find(foundClass => foundClass.classId === this.selectedClassId);
    this.currentClass = cls
      ? { ...cls, students: [...(cls.students || [])] }
      : undefined;
    this.recalculateTable();
  }

  onNewStudent(updatedClass: Class) {
    const classIdx = this.classes.findIndex(cls => cls.classId === updatedClass.classId);
    if (classIdx !== -1) {
      const updatedClasses = [...this.classes];
      updatedClasses[classIdx] = updatedClass;
      this.classes = updatedClasses;
    }
    this.displayClassListForCurrentTeacher();
  }

  ngOnInit() {
    this.baggyBookService.getClasses()
      .subscribe(classes => {
        this.ngZone.run(() => {
          this.classes = [...classes];
          this.recalculateTable();
          this.cdr.detectChanges();
        });
      });
    this.selectedClassId = '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addNewClass(content: TemplateRef<any>) {
    this.modalRef =  this.modalService.show(content);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMultipleStudents(content: TemplateRef<any>) {
    this.modalRef = this.modalService.show(content);
  }

  onClassAdded() {
    this.baggyBookService.getClasses()
      .subscribe(classes => {
        this.ngZone.run(() => {
          this.classes = [...classes];
          this.recalculateTable();
          this.cdr.detectChanges();
        });
      });
  }

  private recalculateTable() {
    // ngx-datatable can miss initial async row updates unless layout is recalculated.
    setTimeout(() => this.table?.recalculate(), 0);
  }
}
