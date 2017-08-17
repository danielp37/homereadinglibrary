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
  editingBook: boolean;
  lastIsbnValue: string;
  private _currentBook: Book;
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
      author : [''],
      editTitle : [''],
      editAuthor : ['']
    });
  }

  onIsbnEntered() {
    const isbnInput = this.addBookForm.get('isbn');
    if (isbnInput.value !== '' && isbnInput.value !== this.lastIsbnValue) {
      this.baggyBookService.getBookByIsbn(isbnInput.value)
        .then(book => {
          this.currentBook = book;
          this.focusBookBarCode();
        })
        .catch(error => {
          this.bookLookupService.getBookFromIsbn(isbnInput.value)
            .then(book => {
              // Check to see if we can find the book by the returned isbn
              this.baggyBookService.getBookByIsbn(book.isbn)
                .then(existingBook => {
                  this.currentBook = existingBook;
                  this.focusBookBarCode();
                })
                .catch(error2 => {
                  book.guidedReadingLevel = this.addBookForm.get('readingLevel').value;
                  book.boxNumber = this.addBookForm.get('boxNumber').value;

                  this.newBook = false;
                  this.addBook(book);
                });
            })
            .catch(e => {
              this.enableNewBookEntry();
            });
        });
    }
    this.lastIsbnValue = isbnInput.value;
  }

  get currentBook(): Book {
    return this._currentBook;
  }

  set currentBook(book: Book) {
    if (book) {
      this.addBookForm.get('readingLevel').setValue(book.guidedReadingLevel);
      this.addBookForm.get('boxNumber').setValue(book.boxNumber);
    }
    this._currentBook = book;
  }

  enableNewBookEntry() {
    this.currentBook = null;
    this.addBookForm.get('author').setValue('');
    this.addBookForm.get('title').setValue('');
    this.newBook = true;
    this.focusBookTitle();
  }

  focusBookBarCode() {
    setTimeout(() => {
                const element = this.renderer.selectRootElement('#formBookBarcode');
                element.focus();
              }, 300);
  }

  focusBookTitle() {
    setTimeout(() => {
      const element = this.renderer.selectRootElement('#formTitle');
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
            this.currentBook = book;
            setTimeout(() => bookCopyInput.setValue(''), 0);
        });
    } else {
      setTimeout(() => bookCopyInput.setValue(''), 0);
    }
    this.lastBookCopyValue = bookCopyInput.value;
  }

  removeBookCopy(barCode: string) {
    this.baggyBookService.removeBookCopy(this.currentBook.id, barCode)
      .then(book => {
        this.onBookAdded.emit(book);
        this.currentBook = book;
      })
  }

  addNewBook() {
    const newBook = new Book();
    newBook.isbn = this.addBookForm.get('isbn').value;
    newBook.author = this.addBookForm.get('author').value;
    newBook.title = this.addBookForm.get('title').value;
    newBook.guidedReadingLevel = this.addBookForm.get('readingLevel').value;
    newBook.boxNumber = this.addBookForm.get('boxNumber').value;
    this.addBook(newBook);
  }

  startEditingBook() {
    this.editingBook = true;
    this.addBookForm.get('editAuthor').setValue(this.currentBook.author);
    this.addBookForm.get('editTitle').setValue(this.currentBook.title);
  }

  updateBook() {
    this.editingBook = false;
    this.baggyBookService.getBook(this.currentBook.id)
      .then(book => {
        book.guidedReadingLevel = this.addBookForm.get('readingLevel').value;
        book.boxNumber = this.addBookForm.get('boxNumber').value;
        book.title = this.addBookForm.get('editTitle').value;
        book.author = this.addBookForm.get('editAuthor').value;
        this.baggyBookService.updateBook(book)
          .then(updatedBook => {
            this.onBookAdded.emit(book);
            this.currentBook = book;
          });
      });
  }
}
