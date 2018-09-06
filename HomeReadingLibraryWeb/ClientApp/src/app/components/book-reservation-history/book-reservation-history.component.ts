import { BaggyBookService } from './../../services/baggy-book.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BookCopyReservationWithData } from './../../entities/book-copy-reservation-with-data';
import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-book-reservation-history',
  templateUrl: './book-reservation-history.component.html',
  styleUrls: ['./book-reservation-history.component.css']
})
export class BookReservationHistoryComponent implements OnInit {

  reservations: BookCopyReservationWithData[];
  checkInBookForm: FormGroup;
  selectedBookBarCode: string;

  constructor(
    private baggyBookService: BaggyBookService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) { }

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
    this.selectedBookBarCode = this.checkInBookForm.value.bookCopyBarCode;
    this.baggyBookService.getBookCopyReservationsForBookCopy(this.selectedBookBarCode)
      .then(reservations => this.reservations = reservations.reservations);
  }
}
