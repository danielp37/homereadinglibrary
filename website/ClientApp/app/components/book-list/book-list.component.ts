import { BookSearchParameters } from './../../services/Book-Search-Parameters';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  searchBookForm: FormGroup;

  constructor(
    private baggyBookService: BaggyBookService,
    private fb: FormBuilder,
  ) {
    this.bookList = {
      books: [],
      count: 0
    };
   }

  ngOnInit(): void {
    this.searchBookForm = this.fb.group({
      searchType : ['Title'],
      searchText : [''],
    });
  }

  refreshBookList(params: DataTableParams) {
    this.lastSearchParams = params;
    this.baggyBookService.getAllBooks(params, this.getBookSearchParameters())
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

  getBookSearchParameters(): BookSearchParameters {
    const searchText = this.searchBookForm.get('searchText').value;
    const searchType = this.searchBookForm.get('searchType').value;
    if (searchText) {
      switch (searchType) {
        case 'Title':
          return { title: searchText };
        case 'Author':
          return { author: searchText };
        case 'ReadingLevel/Box':
          return { boxNumber: searchText };
      }
    }
    return {};
  }

  searchBooks() {
    this.refreshBookList(this.lastSearchParams);
  }

  exportToTab() {
    this.baggyBookService.exportBooks(this.getBookSearchParameters());
  }
}
