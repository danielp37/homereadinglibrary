import { BaggyBookService } from './../../services/baggy-book.service';
import { BookCopyReservationWithData } from './../../entities/book-copy-reservation-with-data';
import { Student } from './../../entities/student';
import { Class } from './../../entities/class';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { TeacherWithStudent } from '../../entities/teacher-with-student';

@Component({
    standalone: false,
  selector: 'app-student-reservation-history',
  templateUrl: './student-reservation-history.component.html',
  styleUrls: ['./student-reservation-history.component.css']
})
export class StudentReservationHistoryComponent implements OnInit {

  classes: Class[];
  selectedClassId: string;
  selectedClass: Class;
  selectedStudentId: string;
  selectedStudent: Student;
  selectedStudentWithTeacher: TeacherWithStudent;
  reservations: BookCopyReservationWithData[];

  constructor(
    private baggyBookService: BaggyBookService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.classes = new Array<Class>();
    this.selectedClassId = '';
    this.selectedStudentId = '';
   }

  ngOnInit() {
    this.baggyBookService.getClasses()
      .subscribe(classes => {
        this.ngZone.run(() => {
          this.classes = [...classes];
          this.cdr.detectChanges();
        });
      });
  }

  displayClassListForCurrentTeacher(): void {
    this.selectedClass = this.classes.find(cls => cls.classId === this.selectedClassId);
    this.selectedStudentId = '';
    this.reservations = undefined;
  }

  displayStudentReservationHistory(): void {
    this.baggyBookService.getBookCopyReservations(this.selectedStudentId)
      .subscribe(reservations => {
        this.ngZone.run(() => {
          this.reservations = [...reservations.reservations];
          this.cdr.detectChanges();
        });
      });
  }

  onStudentBarCodeEntered(): void {
    this.baggyBookService.getStudentByBarCode(this.selectedStudentId)
      .subscribe({
        next: student => {
          this.ngZone.run(() => {
            this.selectedStudentWithTeacher = student;
            this.cdr.detectChanges();
          });
          this.displayStudentReservationHistory();
        },
        error: () => {
          this.ngZone.run(() => {
            this.reservations = undefined;
            this.selectedStudentWithTeacher = {
              student: {
                firstName: 'Student',
                lastName: 'Not Found'
              },
              teacherName: ''
            };
            this.cdr.detectChanges();
          });
        }
      });
  }
}
