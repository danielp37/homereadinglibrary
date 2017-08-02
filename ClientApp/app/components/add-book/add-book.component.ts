import { BookCopy } from './../../entities/book-copy';
import { BaggyBookService } from './../../services/baggy-book.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BookLookupService } from '../../services/book-lookup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Book } from '../../entities/book';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent implements OnInit {
  lastBookCopyValue: number;
  addBookForm: FormGroup;
  lastIsbnValue: string;
  currentBook: Book;
  @Output()onBookAdded = new EventEmitter<Book>();

  constructor(
    private bookLookupService: BookLookupService,
    private baggyBookService: BaggyBookService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.addBookForm = this.fb.group({
      readingLevel : ['A'],
      boxNumber : ['1'],
      isbn : [''],
      bookCopyBarCode : ['']
    });
  }

  onIsbnEntered() {
    const isbnInput = this.addBookForm.get('isbn');
    if (isbnInput.value !== '' && isbnInput.value !== this.lastIsbnValue) {
      this.bookLookupService.getBookFromIsbn(isbnInput.value)
        .then(book => {
          this.currentBook = book;
          this.currentBook.guidedReadingLevel = this.addBookForm.get('readingLevel').value;
          this.currentBook.boxNumber = this.addBookForm.get('boxNumber').value;
          this.baggyBookService.getBook(book.id)
                .then(foundBook => this.currentBook = foundBook)
                .catch(error => {
                    this.baggyBookService.addBook(book);
                    this.onBookAdded.emit(book);
                  })
        });
    }
    this.lastIsbnValue = isbnInput.value;
  }

  onBookCopyEntered() {
    const bookCopyInput = this.addBookForm.get('bookCopyBarCode');
    if (bookCopyInput.value !== '' && bookCopyInput.value !== this.lastBookCopyValue) {
      this.baggyBookService.addBookCopy(this.currentBook.id, bookCopyInput.value)
        .then(book => {
            this.onBookAdded.emit(book);
        });
    }
    this.lastBookCopyValue = bookCopyInput.value;
  }
}
