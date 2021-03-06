import { Class } from './../../entities/class';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CheckoutLogEntry } from './../../entities/checkout-log-entry';
import { BookCopyWithBook } from './../../entities/book-copy-with-book';
import { StudentWithTeacher } from './../../entities/student-with-teacher';
import { Book } from './../../entities/book';
import { Student } from './../../entities/student';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaggyBookService } from './../../services/baggy-book.service';
import { Component, OnInit, Renderer2, TemplateRef } from '@angular/core';
import { TeacherWithStudent } from '../../entities/teacher-with-student';

@Component({
  selector: 'app-check-out-book',
  templateUrl: './check-out-book.component.html',
  styleUrls: ['./check-out-book.component.css']
})
export class CheckOutBookComponent implements OnInit {

  checkOutBookForm: FormGroup;
  currentStudent: TeacherWithStudent;
  currentBook: BookCopyWithBook;
  studentError: string;
  bookError: string;
  checkoutLog: CheckoutLogEntry[];
  public modalRef: BsModalRef;
  classes: Class[];
  selectedClassId: string;

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
    private renderer: Renderer2,
    private modalService: BsModalService
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
        this.checkoutLog.unshift(new CheckoutLogEntry(this.currentStudent, this.currentBook, error.error || error));
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
              this.checkoutLog.unshift(new CheckoutLogEntry(this.currentStudent, this.currentBook, error.error || error));
              this.playFailureSound();
              setTimeout(() => this.resetForm(), 200);
            });
      })
      .catch(error => {
        this.checkoutLog.unshift(new CheckoutLogEntry(this.currentStudent, this.currentBook, error.error || error));
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

  displayAddNewStudentModal(content: TemplateRef<any>) {
    this.baggyBookService.getClasses()
      .then(classes => {
        this.classes = classes;
        this.selectedClassId = '';
        this.modalRef = this.modalService.show(content);
      });
  }

  studentSaved() {
    this.modalRef.hide();
    this.setFocusOnStudentBarCode();
    this.resetForm();
    alert(`Student successfully added!`);
  }
}
