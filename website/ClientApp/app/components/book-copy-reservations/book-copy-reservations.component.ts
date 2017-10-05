import { DataTableParams } from 'angular-2-data-table';
import { BookCopyReservationWithData } from './../../entities/book-copy-reservation-with-data';
import { BaggyBookService } from './../../services/baggy-book.service';
import { BookCopyReservation } from './../../entities/book-copy-reservation';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book-copy-reservations',
  templateUrl: './book-copy-reservations.component.html',
  styleUrls: ['./book-copy-reservations.component.css']
})
export class BookCopyReservationsComponent implements OnInit {

  totalCount: number;
  bookCopyReservations: BookCopyReservationWithData[];
  lastSearchParams: DataTableParams;
  defaultDaysBack = 21;
  currentDaysBack = this.defaultDaysBack;

  constructor(
    private baggyBookService: BaggyBookService
  ) {
    this.lastSearchParams = {
      offset: 0,
      limit: 10
    };
    this.bookCopyReservations = [];
    this.totalCount = 0;
  }

  ngOnInit() {

  }

  getBookCopyReservations() {
    this.baggyBookService.getBookCopyReservations(undefined, this.lastSearchParams, this.currentDaysBack)
      .then(bcr => {
        this.totalCount = bcr.count;
        this.bookCopyReservations = bcr.reservations;
      });
  }

  refreshBookList(params: DataTableParams) {
    this.lastSearchParams = params;
    this.getBookCopyReservations();
  }

  updateBookList(daysBack: number) {
    this.currentDaysBack = daysBack;
    this.refreshBookList({offset: 0, limit: 10});
  }

}
