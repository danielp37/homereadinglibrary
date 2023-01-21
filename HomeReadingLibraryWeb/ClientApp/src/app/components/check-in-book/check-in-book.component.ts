import { CheckinLogEntry } from './../../entities/checkin-log-entry';
import { BaggyBookService } from './../../services/baggy-book.service';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { BookCopyWithBook } from './../../entities/book-copy-with-book';
import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-check-in-book',
  templateUrl: './check-in-book.component.html',
  styleUrls: ['./check-in-book.component.css']
})
export class CheckInBookComponent implements OnInit {

  checkInBookForm: UntypedFormGroup;
  currentBook: BookCopyWithBook;
  bookError: string;
  checkinLog: CheckinLogEntry[];

  constructor(
    private baggyBookService: BaggyBookService,
    private fb: UntypedFormBuilder,
    private renderer: Renderer2
  ) {
    this.checkinLog = new Array<CheckinLogEntry>();
  }

  ngOnInit() {
    this.checkInBookForm = this.fb.group({
      bookCopyBarCode: ['']
    });
    this.setFocusOnBookBarCode();
  }

  setFocusOnBookBarCode() {
      const bookBarCodeInput = this.renderer.selectRootElement('#formBookBarcode');
      bookBarCodeInput.focus();
  }

  onBookCopyEntered() {
    this.currentBook = undefined;
    const bookCopyValue = this.checkInBookForm.value.bookCopyBarCode;
    this.baggyBookService.getBookCopyByBarCode(bookCopyValue)
      .then(bookCopy => {
          this.currentBook = bookCopy;
          this.baggyBookService.checkInBookCopy(bookCopyValue)
            .then(result => {
              this.checkinLog.unshift(new CheckinLogEntry(this.currentBook));
              this.playSuccessSound();
              setTimeout(() => this.resetForm(), 500);
            })
            .catch(error => {
              this.checkinLog.unshift(new CheckinLogEntry(this.currentBook, error.error || error));
              this.playFailureSound();
              setTimeout(() => this.resetForm(), 500);
            });
      })
      .catch(error => {
        this.checkinLog.unshift(new CheckinLogEntry(this.currentBook, error.error || error));
        this.playFailureSound();
        setTimeout(() => this.resetForm(), 500);
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

  resetForm() {
    this.checkInBookForm.reset();
    this.currentBook = undefined;
  }
}
