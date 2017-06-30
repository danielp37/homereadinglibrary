import {Http} from '@angular/http';
import { Injectable } from '@angular/core';
import { Book } from '../entities/book';
import { IsbnEntry } from '../entities/isbn-entry';

@Injectable()
export class BookLookupService {
  private isbnUrl = 'http://isbndb.com/api/v2/json/QQ6LFTNI/book/';

  constructor(
    private http: Http
  ) { }

  getBookFromIsbn(isbn: string): Promise<Book> {
    return this.http.get(`${this.isbnUrl}${isbn}`)
      .toPromise()
      .then(resp => {
        const isbnEntry = resp.json().data[0] as IsbnEntry;
        if (isbnEntry === undefined) {
          return undefined;
        }
        return Book.fromIsbnEntry(isbnEntry);
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
