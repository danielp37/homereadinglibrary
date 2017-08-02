import { Component, OnInit } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Book } from '../../entities/book';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: Book[];

  constructor(
    private baggyBookService: BaggyBookService
  ) { }

  ngOnInit() {
    this.refreshBookList();
  }

  refreshBookList() {
    this.baggyBookService.getAllBooks()
      .then(books => this.books = books);
  }

  bookAdded(newBook: Book) {
    const existingBook = this.books.find(book => book.id === newBook.id);
    if (existingBook === undefined) {
      this.books.push(newBook);
    } else {
      const index = this.books.indexOf(existingBook);
      this.books[index] = newBook;
    }
  }
}
