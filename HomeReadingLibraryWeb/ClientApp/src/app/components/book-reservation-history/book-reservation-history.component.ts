import { BaggyBookService } from './../../services/baggy-book.service';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { BookCopyReservationWithData } from './../../entities/book-copy-reservation-with-data';
import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-book-reservation-history',
  templateUrl: './book-reservation-history.component.html',
  styleUrls: ['./book-reservation-history.component.css']
})
export class BookReservationHistoryComponent implements OnInit {

  isLost: boolean;
  lostDate: Date;
  isDamaged: boolean;
  damagedDate: Date;
  comments: string;
  reservations: BookCopyReservationWithData[];
  checkInBookForm: UntypedFormGroup;
  selectedBookBarCode: string;

  constructor(
    private baggyBookService: BaggyBookService,
    private fb: UntypedFormBuilder,
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
      .then(reservations => {
        this.reservations = reservations.reservations;
        const firstReservation = this.reservations[0];
        if(firstReservation)
        {
          this.isLost = firstReservation.bookCopy.isLost;
          this.lostDate = firstReservation.bookCopy.lostDate;
          this.isDamaged = firstReservation.bookCopy.isDamaged;
          this.damagedDate = firstReservation.bookCopy.damagedDate;
          this.comments = firstReservation.bookCopy.comments;
        }
        else
        {
          this.isLost = undefined;
          this.lostDate = undefined;
          this.isDamaged = undefined;
          this.damagedDate = undefined;
          this.comments = undefined;
        }
      });
  }
}
