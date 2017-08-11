import { BookCopy } from './../../entities/book-copy';
import { BaggyBookService } from './../../services/baggy-book.service';
import { Component, OnInit, Output, EventEmitter, Renderer2 } from '@angular/core';
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
  newBook: boolean;
  lastIsbnValue: string;
  currentBook: Book;
  @Output()onBookAdded = new EventEmitter<Book>();

  constructor(
    private bookLookupService: BookLookupService,
    private baggyBookService: BaggyBookService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.newBook = false;
   }

  ngOnInit() {
    this.addBookForm = this.fb.group({
      readingLevel : ['A'],
      boxNumber : ['1'],
      isbn : [''],
      bookCopyBarCode : [''],
      title : [''],
      author : ['']
    });
  }

  onIsbnEntered() {
    const isbnInput = this.addBookForm.get('isbn');
    if (isbnInput.value !== '' && isbnInput.value !== this.lastIsbnValue) {
      this.baggyBookService.getBookByIsbn(isbnInput.value)
        .then(book => this.currentBook = book)
        .catch(error => {
          this.bookLookupService.getBookFromIsbn(isbnInput.value)
            .then(book => {
              book.guidedReadingLevel = this.addBookForm.get('readingLevel').value;
              book.boxNumber = this.addBookForm.get('boxNumber').value;

              this.addBook(book);
            })
            .catch(e => {
              this.currentBook = null;
              this.newBook = true;
            });
        });
    }
    this.lastIsbnValue = isbnInput.value;
  }

  focusBookBarCode() {
    setTimeout(() => {
                const element = this.renderer.selectRootElement('#formBookBarcode');
                element.focus();
              }, 300);
  }

  addBook(book: Book) {
    this.baggyBookService.addBook(book)
                      .then(b => {
                        this.onBookAdded.emit(b)
                        this.focusBookBarCode();
                        this.currentBook = b;
                        this.newBook = false;
                      });
  }

  onBookCopyEntered() {
    const bookCopyInput = this.addBookForm.get('bookCopyBarCode');
    if (bookCopyInput.value !== '' && bookCopyInput.value !== this.lastBookCopyValue) {
      this.baggyBookService.addBookCopy(this.currentBook.id, bookCopyInput.value)
        .then(book => {
            this.onBookAdded.emit(book);
            setTimeout(() => bookCopyInput.setValue(''), 1000);
        });
    } else {
      setTimeout(() => bookCopyInput.setValue(''), 1000);
    }
    this.lastBookCopyValue = bookCopyInput.value;
  }

  addNewBook() {
    const newBook = new Book();
    newBook.isbn = this.addBookForm.get('isbn').value;
    newBook.author = this.addBookForm.get('author').value;
    newBook.title = this.addBookForm.get('title').value;
    newBook.guidedReadingLevel = this.addBookForm.get('readingLevel').value;
    newBook.boxNumber = this.addBookForm.get('boxNumber').value;
    newBook.id = newBook.title.replace(' ', '_').toLowerCase();
    this.addBook(newBook);
  }
}
