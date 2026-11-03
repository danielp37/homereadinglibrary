import { ChangeDetectorRef, Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Class } from '../../entities/class';
import { Student } from '../../entities/student';
import { AuthService } from '../../modules/app-auth/services/auth.service';
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
  studentToEdit?: Student;
  studentToRemove?: Student;
  editFirstName = '';
  editLastName = '';
  editTeacherName = '';
  editGrade: number;
  errorMessage = '';

  columns = [
    { prop: 'firstName', name: "First Name"},
    { prop: 'lastName', name: "Last Name"},
    { prop: 'barCode', name: "Bar Code"}
  ];

  constructor(
    private baggyBookService: BaggyBookService,
    private modalService: BsModalService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
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

  get isAdmin(): boolean {
    return !!this.authService.isAdmin;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openEditStudent(student: Student, content: TemplateRef<any>) {
    this.errorMessage = '';
    this.studentToEdit = student;
    this.editFirstName = student.firstName;
    this.editLastName = student.lastName;
    this.modalRef = this.modalService.show(content);
  }

  saveStudent() {
    const first = (this.editFirstName || '').trim();
    const last = (this.editLastName || '').trim();
    if (!this.studentToEdit || !first || !last) {
      this.errorMessage = 'First and last name are required.';
      return;
    }
    this.baggyBookService.updateStudent(this.selectedClassId, this.studentToEdit.barCode, first, last)
      .subscribe({
        next: updatedClass => {
          this.modalRef?.hide();
          this.onNewStudent(updatedClass);
        },
        error: () => this.errorMessage = 'Unable to update student.'
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirmRemoveStudent(student: Student, content: TemplateRef<any>) {
    this.errorMessage = '';
    this.studentToRemove = student;
    this.modalRef = this.modalService.show(content);
  }

  removeStudent() {
    if (!this.studentToRemove) {
      return;
    }
    this.baggyBookService.removeStudent(this.selectedClassId, this.studentToRemove.barCode)
      .subscribe({
        next: updatedClass => {
          this.studentToRemove = undefined;
          this.modalRef?.hide();
          this.onNewStudent(updatedClass);
        },
        error: () => this.errorMessage = 'Unable to remove student.'
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openEditClass(content: TemplateRef<any>) {
    this.errorMessage = '';
    this.editTeacherName = this.currentClass.teacherName;
    this.editGrade = this.currentClass.grade;
    this.modalRef = this.modalService.show(content);
  }

  saveClass() {
    const name = (this.editTeacherName || '').trim();
    if (!name || this.editGrade === null || this.editGrade === undefined) {
      this.errorMessage = 'Teacher name and grade are required.';
      return;
    }
    this.baggyBookService.updateClass(this.selectedClassId, name, Number(this.editGrade))
      .subscribe({
        next: updatedClass => {
          this.modalRef?.hide();
          this.onNewStudent(updatedClass);
        },
        error: () => this.errorMessage = 'Unable to update class.'
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirmDeleteClass(content: TemplateRef<any>) {
    this.errorMessage = '';
    this.modalRef = this.modalService.show(content);
  }

  deleteClass() {
    const deletedId = this.selectedClassId;
    this.baggyBookService.deleteClass(deletedId)
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.modalRef?.hide();
            setTimeout(() => {
              this.classes = this.classes.filter(cls => cls.classId !== deletedId);
              this.selectedClassId = '';
              this.currentClass = undefined;
              this.cdr.detectChanges();
            });
          });
        },
        error: () => this.errorMessage = 'Unable to delete class.'
      });
  }

  private recalculateTable() {
    // ngx-datatable can miss initial async row updates unless layout is recalculated.
    setTimeout(() => this.table?.recalculate(), 0);
  }
}
