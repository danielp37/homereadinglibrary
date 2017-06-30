import { Component, OnInit } from '@angular/core';
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

  constructor(
    private bookLookupService: BookLookupService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.addBookForm = this.fb.group({
      isbn : [''],
      bookCopyBarCode : ['']
    });
  }

  onIsbnEntered() {
    const isbnInput = this.addBookForm.get('isbn');
    this.bookLookupService.getBookFromIsbn(isbnInput.value)
      .then(book => this.currentBook = book);
  }
}
