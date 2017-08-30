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
    const barCodeValue = this.checkOutBookForm.value.studentBarCode;
    this.baggyBookService.getStudentByBarCode(barCodeValue)
      .then(student => this.currentStudent = student);
  }

  onBookCopyEntered() {
    const bookCopyValue = this.checkOutBookForm.value.bookCopyBarCode;
    const barCodeValue = this.checkOutBookForm.value.studentBarCode;
    this.baggyBookService.getBookCopyByBarCode(bookCopyValue)
      .then(bookCopy => {
          this.currentBook = bookCopy;
          this.baggyBookService.checkOutBookForStudent(bookCopyValue, barCodeValue)
            .then(bookCopyReservation => {
              this.playSuccessSound();
              setTimeout(() => this.resetForm(), 2000);
            });
      });

  }

  playSuccessSound() {
    const notificationSuccess = this.renderer.selectRootElement('#notificationSuccess');
    notificationSuccess.play();
  }


}
