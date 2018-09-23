import { BookSearchParameters } from './../../services/Book-Search-Parameters';
import { DataTableParams } from 'angular-2-data-table';
import { BookCopyReservationWithData } from './../../entities/book-copy-reservation-with-data';
import { BaggyBookService } from './../../services/baggy-book.service';
import { BookCopyReservation } from './../../entities/book-copy-reservation';
import { Component, OnInit, Renderer2 } from '@angular/core';

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
  downloadLink: string;
  searchType = 'Title';
  searchText = '';


  constructor(
    private baggyBookService: BaggyBookService,
    private renderer: Renderer2
  ) {
    this.lastSearchParams = {
      offset: 0,
      limit: 10
    };
    this.bookCopyReservations = [];
    this.totalCount = 0;
  }

  ngOnInit() {
    setTimeout(() => this.refreshBookList(this.lastSearchParams), 0);
  }

  getBookCopyReservations() {
    this.baggyBookService.getBookCopyReservations(undefined, this.lastSearchParams, this.currentDaysBack, this.getBookSearchParameters())
      .then(bcr => {
        this.totalCount = bcr.count;
        this.bookCopyReservations = bcr.reservations;
      });
  }

  exportToTab() {
    this.baggyBookService.downloadBookCopyReservations(undefined, this.lastSearchParams, this.currentDaysBack
      , this.getBookSearchParameters())
      .then(b => {
        this.downloadLink = b.downloadLink;
        setTimeout(() => this.clickDownloadLink(), 0);
      });
  }

  clickDownloadLink() {
    const downloadReport = this.renderer.selectRootElement('#downloadReport');
    downloadReport.click();
  }

  refreshBookList(params: DataTableParams) {
    this.lastSearchParams = params;
    this.getBookCopyReservations();
  }

  setPage(pageInfo) {
    this.lastSearchParams.offset = pageInfo.offset * this.lastSearchParams.limit;
    this.lastSearchParams.limit = this.lastSearchParams.limit;
    this.refreshBookList(this.lastSearchParams);
  }

  onSort($event) {
    this.lastSearchParams.sortBy = $event.sorts[0].prop;
    this.lastSearchParams.sortAsc = $event.sorts[0].dir === "asc";
    this.refreshBookList(this.lastSearchParams);
  }

  updateBookList(daysBack: number) {
    this.currentDaysBack = daysBack;
    this.refreshBookList({offset: 0, limit: 10});
  }

  getBookSearchParameters(): BookSearchParameters {
    if (this.searchText) {
      switch (this.searchType) {
        case 'Title':
          return { title: this.searchText };
        case 'Author':
          return { author: this.searchText };
        case 'ReadingLevel/Box':
          return { boxNumber: this.searchText };
        case 'Book BarCode':
          return { bookBarCode: this.searchText };
        case 'Teacher':
          return { teacherName: this.searchText };
        case 'Student Name':
          return { studentName: this.searchText };
        case 'Book BarCode':
          return { bookBarCode: this.searchText };
        case 'Grade':
          return { grade: this.searchText };
      }
    }
    return {};
  }
}
