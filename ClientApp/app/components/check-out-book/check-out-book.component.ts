import { Book } from './../../entities/book';
import { Student } from './../../entities/student';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaggyBookService } from './../../services/baggy-book.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-check-out-book',
  templateUrl: './check-out-book.component.html',
  styleUrls: ['./check-out-book.component.css']
})
export class CheckOutBookComponent implements OnInit {

  checkOutBookForm: FormGroup;
  currentStudent: Student;
  currentBook: Book;

  resetForm() {
    this.checkOutBookForm.reset();
    this.currentBook = undefined;
    this.currentStudent = undefined;
  }

  constructor(
    private baggyBookService: BaggyBookService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.checkOutBookForm = this.fb.group({
      studentBarCode: [''],
      bookCopyBarCode: ['']
    });
  }

  onStudentBarCodeEntered() {
    const barCodeField = this.checkOutBookForm.get('studentBarCode');
    this.baggyBookService.getStudentByBarCode(barCodeField.value)
      .then(student => this.currentStudent = student);
  }

  onBookCopyEntered() {
    const bookCopyField = this.checkOutBookForm.get('bookCopyBarCode');
    this.baggyBookService.getBookCopyByBarCode(bookCopyField.value)
      .then(bookCopy => {
        this.baggyBookService.getBook(bookCopy.bookId)
          .then(book => {
            this.currentBook = book;
            setTimeout(() => this.resetForm(), 1000);
          })
      });

  }


}
