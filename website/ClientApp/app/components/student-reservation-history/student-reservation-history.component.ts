import { BaggyBookService } from './../../services/baggy-book.service';
import { BookCopyReservationWithData } from './../../entities/book-copy-reservation-with-data';
import { Student } from './../../entities/student';
import { Class } from './../../entities/class';
import { Component, OnInit } from '@angular/core';

@Component({
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
  reservations: BookCopyReservationWithData[];

  constructor(private baggyBookService: BaggyBookService) {
    this.classes = new Array<Class>();
    this.selectedClassId = '';
    this.selectedStudentId = '';
   }

  ngOnInit() {
    this.baggyBookService.getClasses()
      .then(classes => this.classes = classes);
  }

  displayClassListForCurrentTeacher(): void {
    this.selectedClass = this.classes.find(cls => cls.classId === this.selectedClassId);
    this.selectedStudentId = '';
    this.reservations = undefined;
  }

  displayStudentReservationHistory(): void {
    this.baggyBookService.getBookCopyReservations(this.selectedStudentId)
      .then(reservations => this.reservations = reservations.reservations);
  }
}
