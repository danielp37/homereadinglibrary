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
    this.books.push(newBook);
  }
}
