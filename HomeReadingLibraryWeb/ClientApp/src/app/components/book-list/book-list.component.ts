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
  currentBookIsbn: string;
  loadingIndicator: boolean = false;
  selected = [];
  columns = [
    { prop: 'title', sortable: false},
    { prop: 'author', sortable: false},
    { prop: 'guidedReadingLevel', name: "Reading Level", sortable: false},
    { prop: 'publisherText', name: "Publisher Text", sortable: false},
    { prop: 'boxNumber', name:"Box", sortable: false},
    { prop: 'isbn', name: "ISBN", sortable: false},
    { prop: 'bookCopyCount', name:"Copies", sortable: false}
  ];

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
    let params : DataTableParams = {
      offset : 0,
      limit : 10
    };
    this.refreshBookList(params);
  }

  public get books() : Book[] {
    return this.bookList.books;
  }

  setPage(pageInfo) {
    const params : DataTableParams = {
      offset : pageInfo.offset * this.lastSearchParams.limit,
      limit : this.lastSearchParams.limit
    }
    this.refreshBookList(params);
  }

  refreshBookList(params: DataTableParams) {
    this.loadingIndicator = true;
    this.lastSearchParams = params;
    this.baggyBookService.getAllBooks(params, this.getBookSearchParameters())
      .then(bookList => {
        this.bookList = bookList;
        this.loadingIndicator = false;
      })
      .catch(() => this.loadingIndicator = false);
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
        case 'Book BarCode':
          return { bookBarCode: searchText };
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

  rowClicked(rowEvent) {
    this.currentBookIsbn = rowEvent.row.item.isbn;
  }

  onSelect({ selected }) {
    this.currentBookIsbn = selected[0].isbn;
  }

}
