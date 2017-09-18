import { CheckoutLogEntry } from './../../entities/checkout-log-entry';
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
  checkoutLog: CheckoutLogEntry[];

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
  ) {
    this.checkoutLog = new Array<CheckoutLogEntry>();
  }

  ngOnInit() {
    this.checkOutBookForm = this.fb.group({
      studentBarCode: [''],
      bookCopyBarCode: ['']
    });
    this.setFocusOnStudentBarCode();
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
        this.checkoutLog.unshift(new CheckoutLogEntry(this.currentStudent, this.currentBook, error._body || error));
        this.playFailureSound();
        setTimeout(() => this.resetForm(), 200);
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
              this.checkoutLog.unshift(new CheckoutLogEntry(this.currentStudent, this.currentBook));
              this.playSuccessSound();
              setTimeout(() => this.resetForm(), 200);
            })
            .catch(error => {
              this.checkoutLog.unshift(new CheckoutLogEntry(this.currentStudent, this.currentBook, error._body || error));
              this.playFailureSound();
              setTimeout(() => this.resetForm(), 200);
            });
      })
      .catch(error => {
        this.checkoutLog.unshift(new CheckoutLogEntry(this.currentStudent, this.currentBook, error._body || error));
        this.playFailureSound();
        setTimeout(() => this.resetForm(), 200);
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

}
