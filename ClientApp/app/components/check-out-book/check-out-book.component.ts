import { BookCopyWithBook } from './../../entities/book-copy-with-book';
import { StudentWithTeacher } from './../../entities/student-with-teacher';
import { Book } from './../../entities/book';
import { Student } from './../../entities/student';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaggyBookService } from './../../services/baggy-book.service';
import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-check-out-book',
  templateUrl: './check-out-book.component.html',
  styleUrls: ['./check-out-book.component.css']
})
export class CheckOutBookComponent implements OnInit {

  checkOutBookForm: FormGroup;
  currentStudent: StudentWithTeacher;
  currentBook: BookCopyWithBook;
  studentError: string;
  bookError: string;

  resetForm() {
    this.checkOutBookForm.reset();
    this.currentBook = undefined;
    this.currentStudent = undefined;
    this.setFocusOnStudentBarCode();
  }

  setFocusOnStudentBarCode() {
    const studentBarCodeInput = this.renderer.selectRootElement('#formStudentBarCode');
    studentBarCodeInput.focus();
  }

  setFocusOnBookBarCode() {
    setTimeout(() => {
        const bookBarCodeInput = this.renderer.selectRootElement('#formBookBarcode');
        bookBarCodeInput.focus();
      }, 200);
  }

  constructor(
    private baggyBookService: BaggyBookService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.checkOutBookForm = this.fb.group({
      studentBarCode: [''],
      bookCopyBarCode: ['']
    });
  }

  onStudentBarCodeEntered() {
    this.currentStudent = undefined;
    const barCodeValue = this.checkOutBookForm.value.studentBarCode;
    this.baggyBookService.getStudentByBarCode(barCodeValue)
      .then(student => {
        this.setFocusOnBookBarCode();
        this.currentStudent = student;
      })
      .catch(error => {
        this.playFailureSound();
        this.setStudentError(error._body || error);
        setTimeout(() => this.resetForm(), 2000);
      });
  }

  onBookCopyEntered() {
    this.currentBook = undefined;
    const bookCopyValue = this.checkOutBookForm.value.bookCopyBarCode;
    const barCodeValue = this.checkOutBookForm.value.studentBarCode;
    this.baggyBookService.getBookCopyByBarCode(bookCopyValue)
      .then(bookCopy => {
          this.currentBook = bookCopy;
          this.baggyBookService.checkOutBookForStudent(bookCopyValue, barCodeValue)
            .then(bookCopyReservation => {
              this.playSuccessSound();
              setTimeout(() => this.resetForm(), 2000);
            })
            .catch(error => {
              this.playFailureSound();
              this.setBookError(error._body || error);
              setTimeout(() => this.resetForm(), 2000);
            });
      })
      .catch(error => {
        this.playFailureSound();
        this.setBookError(error._body || error);
        setTimeout(() => this.resetForm(), 2000);
      });

  }

  playSuccessSound() {
    const notificationSuccess = this.renderer.selectRootElement('#notificationSuccess');
    notificationSuccess.play();
  }

  playFailureSound() {
    const notificationFailure = this.renderer.selectRootElement('#notificationFailure');
    notificationFailure.play();
  }

  setStudentError(status: string) {
    this.studentError = status;
    setTimeout(() => this.studentError = null, 2000);
  }

  setBookError(status: string) {
    this.bookError = status;
    setTimeout(() => this.bookError = null, 2000);
  }
}
