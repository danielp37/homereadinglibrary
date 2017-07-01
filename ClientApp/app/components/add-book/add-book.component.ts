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
  addBookForm: FormGroup;
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
    this.bookLookupService.getBookFromIsbn(isbnInput.value)
      .then(book => {
        this.currentBook = book;
        this.currentBook.guidedReadingLevel = this.addBookForm.get('readingLevel').value;
        this.currentBook.boxNumber = this.addBookForm.get('boxNumber').value;
        this.baggyBookService.addBook(book);
        this.onBookAdded.emit(book);
      });
  }
}
