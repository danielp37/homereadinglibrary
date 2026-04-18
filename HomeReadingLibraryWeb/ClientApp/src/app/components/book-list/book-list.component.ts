import { BookSearchParameters } from './../../services/Book-Search-Parameters';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataTableParams } from './../../models/data-table-params';
import { BookList } from './../../entities/book-list';
import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Book } from '../../entities/book';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AddBookModalComponent } from '../add-book-modal/add-book-modal.component';
import { EditBookModalComponent } from '../edit-book-modal/edit-book-modal.component';

import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxDatatableModule, AddBookModalComponent, EditBookModalComponent],
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  @ViewChild(EditBookModalComponent) editBookModal?: EditBookModalComponent;

  bookList: BookList;
  lastSearchParams: DataTableParams;
  searchBookForm: UntypedFormGroup;
  loadingIndicator = false;
  selected = [];

  constructor(
    private baggyBookService: BaggyBookService,
    private fb: UntypedFormBuilder,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
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
    const params : DataTableParams = {
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
      .subscribe({
        next: bookList => {
          this.ngZone.run(() => {
            this.bookList = {
              count: bookList.count,
              books: [...bookList.books]
            };
            this.recalculateTable();
            this.loadingIndicator = false;
            this.cdr.detectChanges();
          });
        }, 
        error: () => {
          this.ngZone.run(() => {
            this.loadingIndicator = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  bookAdded(newBook: Book) {
    const existingBook = this.bookList.books.find(book => book.id === newBook.id);
    if (existingBook === undefined) {
      this.refreshBookList(this.lastSearchParams);
    } else {
      const index = this.bookList.books.indexOf(existingBook);
      const updatedBooks = [...this.bookList.books];
      updatedBooks[index] = newBook;
      this.bookList = {
        count: this.bookList.count,
        books: updatedBooks
      };
      this.recalculateTable();
    }
  }

  private recalculateTable() {
    // ngx-datatable can miss initial async row updates unless layout is recalculated.
    setTimeout(() => this.table?.recalculate(), 0);
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
    this.lastSearchParams.offset = 0;
    this.refreshBookList(this.lastSearchParams);
  }

  exportToTab() {
    this.baggyBookService.exportBooks(this.getBookSearchParameters());
  }

  onSelect({ selected }) {
    this.selected = selected;
  }

  openEditBookModal(book: Book): void {
    this.editBookModal?.open(book, 'edit');
  }

  openAddCopyModal(book: Book): void {
    this.editBookModal?.open(book, 'add-copy');
  }

}
