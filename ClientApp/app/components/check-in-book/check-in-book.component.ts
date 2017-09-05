import { BaggyBookService } from './../../services/baggy-book.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BookCopyWithBook } from './../../entities/book-copy-with-book';
import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-check-in-book',
  templateUrl: './check-in-book.component.html',
  styleUrls: ['./check-in-book.component.css']
})
export class CheckInBookComponent implements OnInit {

  checkInBookForm: FormGroup;
  currentBook: BookCopyWithBook;
  bookError: string;

  constructor(
    private baggyBookService: BaggyBookService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.checkInBookForm = this.fb.group({
      bookCopyBarCode: ['']
    });
  }

  onBookCopyEntered() {
    this.currentBook = undefined;
    const bookCopyValue = this.checkInBookForm.value.bookCopyBarCode;
    this.baggyBookService.getBookCopyByBarCode(bookCopyValue)
      .then(bookCopy => {
          this.currentBook = bookCopy;
          this.baggyBookService.checkInBookCopy(bookCopyValue)
            .then(result => {
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

  setBookError(status: string) {
    this.bookError = status;
    setTimeout(() => this.bookError = null, 2000);
  }

  resetForm() {
    this.checkInBookForm.reset();
    this.currentBook = undefined;
  }
}
