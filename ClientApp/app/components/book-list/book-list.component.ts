import { DataTableParams } from 'angular-2-data-table';
import { BookList } from './../../entities/book-list';
import { Component, OnInit } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Book } from '../../entities/book';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  bookList: BookList;
  lastSearchParams: DataTableParams;

  constructor(
    private baggyBookService: BaggyBookService
  ) {
    this.bookList = {
      books: [],
      count: 0
    };
   }

  ngOnInit(): void {
  }

  refreshBookList(params: DataTableParams) {
    this.lastSearchParams = params;
    this.baggyBookService.getAllBooks(params)
      .then(bookList => this.bookList = bookList);
  }

  bookAdded(newBook: Book) {
    const existingBook = this.bookList.books.find(book => book.id === newBook.id);
    if (existingBook === undefined) {
      this.refreshBookList(this.lastSearchParams);
    } else {
      const index = this.bookList.books.indexOf(existingBook);
      this.bookList.books[index] = newBook;
    }
  }
}
