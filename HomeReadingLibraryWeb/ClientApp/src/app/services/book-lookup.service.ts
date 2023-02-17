import { Injectable } from '@angular/core';
import { Book } from '../entities/book';
import { IsbnEntry } from '../entities/isbn-entry';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class BookLookupService {
  private isbnUrl = '/api/booklookup/';

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService,
  ) { }

  private get authHeaders() : HttpHeaders {
    const authHeader = new HttpHeaders({
      "Authorization": "Bearer " + this.oauthService.getAccessToken()
    });
    return authHeader;
  }

  getBookFromIsbn(isbn: string): Promise<Book> {
    return this.http.get<IsbnEntry>(`${this.isbnUrl}${isbn}`, {headers: this.authHeaders})
      .toPromise()
      .then(isbnEntry => {
        if (isbnEntry === undefined) {
          return undefined;
        }
        return Book.fromIsbnEntry(isbnEntry);
      })
      .catch(this.handleError);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
