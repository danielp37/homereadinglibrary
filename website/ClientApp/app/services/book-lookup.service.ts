import { AuthHttp } from 'angular2-jwt';
import {Http} from '@angular/http';
import { Injectable, Inject } from '@angular/core';
import { Book } from '../entities/book';
import { IsbnEntry } from '../entities/isbn-entry';

@Injectable()
export class BookLookupService {
  private isbnUrl = '/api/booklookup/';

  constructor(
    private authHttp: AuthHttp,
    @Inject('ORIGIN_URL') private originUrl: string
  ) { }

  getBookFromIsbn(isbn: string): Promise<Book> {
    return this.authHttp.get(`${this.originUrl}${this.isbnUrl}${isbn}`)
      .toPromise()
      .then(resp => {
        const isbnEntry = resp.json() as IsbnEntry;
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
