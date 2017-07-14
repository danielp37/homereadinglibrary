import { BookCopyReservation } from './../../entities/book-copy-reservation';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book-copy-reservations',
  templateUrl: './book-copy-reservations.component.html',
  styleUrls: ['./book-copy-reservations.component.css']
})
export class BookCopyReservationsComponent implements OnInit {

  bookCopyReservations: BookCopyReservation[];

  constructor() { }

  ngOnInit() {
  }

}
