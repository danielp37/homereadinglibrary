import { VolunteerWithLogons } from './../entities/volunteer-with-logons';
import { LoaderService } from './loader.service';
import { AuthService } from './../modules/app-auth/services/auth.service';
import { ClassWithVolunteers } from './../entities/class-with-volunteers';
import { BookCopyReservationWithData } from './../entities/book-copy-reservation-with-data';
import { BookCopyWithBook } from './../entities/book-copy-with-book';
import { TeacherWithStudent } from './../entities/teacher-with-student';
import { BookSearchParameters } from './Book-Search-Parameters';
import { BookList } from './../entities/book-list';
import { DataTableParams } from 'angular-2-data-table';
import { BookCopyReservation } from './../entities/book-copy-reservation';
import { Student } from './../entities/student';
import { Injectable } from '@angular/core';

import { Class } from '../entities/class';
import { Book } from '../entities/book';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { Volunteer } from '../entities/volunteer';
import { Observable} from 'rxjs';
import { catchError, map  } from 'rxjs/operators';
import { ClassStatistics } from '../entities/class-statistics';

interface ClassWithVolunteersResult {
    data : ClassWithVolunteers[]
}

@Injectable()
export class BaggyBookService {
  private studentsUrl = '/api/students';
  private volunteersUrl = '/api/volunteers'
  private classesUrl = '/api/classes'
  private booksUrl = '/api/books'
  private bookCheckOutUrl = '/api/bookcopyreservations'


  constructor(private http: HttpClient,
    // @Inject('ORIGIN_URL') private originUrl: string,
    private authService: AuthService,
    private oauthService: OAuthService,
    // private http: http,
    private loaderService: LoaderService) { }

  private getAuthHeaders(includeContentType: boolean) : HttpHeaders {
    let authHeader = new HttpHeaders({
      "Authorization": "Bearer " + this.oauthService.getAccessToken()
    });
    if(includeContentType) {
      authHeader = authHeader.append("Content-Type", "application/json");
    }
    return authHeader;
  }

  createVolunteer(volunteer: Volunteer): Observable<Volunteer> {
    return this.http
      .post<Volunteer>(`${this.volunteersUrl}`, JSON.stringify(volunteer), {headers: this.getAuthHeaders(true)})
      .pipe(
        catchError(err => this.handleObservableError<Volunteer>(err))
      );
  }

  getVolunteers(): Observable<Volunteer[]> {
    return this.http
      .get<{ data: Volunteer[]}>(`${this.volunteersUrl}`)
      .pipe(
        map(resp => resp.data),
        catchError(err => this.handleObservableError<Volunteer[]>(err))
      );
  }

  getClasses(): Observable<Class[]> {
    return this.http
      .get<{ data: Class[]}>(`${this.classesUrl}`)
      .pipe(
        map(resp => resp.data),
        catchError(err => this.handleObservableError<Class[]>(err))
      );
  }

  getClassesWithVolunteers(): Observable<ClassWithVolunteers[]> {
    this.loaderService.display(true);
    return this.http
    .get<ClassWithVolunteersResult>(`${this.volunteersUrl}/byclass`)
    .pipe(
      map(response => {
        this.loaderService.display(false);
        return response.data;
        }),
      catchError(err => this.handleObservableError<ClassWithVolunteers[]>(err))
    )
  }

  addClass(teacherName: string, grade: number): Observable<Class> {
    return this.http
      .post<{ data: Class }>(`${this.classesUrl}`, JSON.stringify({teacherName: teacherName, grade: grade}), {headers: this.getAuthHeaders(true)})
      .pipe(
        map(response => {
          return response.data;
        }),
        catchError(err => this.handleObservableError<Class>(err))
      );
  }

  getStudents(classId: string): Observable<Student[]> {
    return this.http
      .get<{ data: Student[] }>(`${this.classesUrl}/${classId}/students`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(response => {
          return response.data;
        }),
        catchError(err => this.handleObservableError<Student[]>(err))
      )
  }

  addStudent(classId: string, newStudent: Student): Observable<Class> {
    return this.http
      .post<{ data: Class }>(`${this.classesUrl}/${classId}/students`, JSON.stringify(newStudent), {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => res.data),
        catchError(err => this.handleObservableError<Class>(err))
      );
  }

  addNewStudent(classId: string, newStudent: Student): Observable<Class> {
    return this.http
      .post<{ data: Class }>(`${this.classesUrl}/${classId}/newstudent`, JSON.stringify(newStudent), {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => res.data),
        catchError(err => this.handleObservableError<Class>(err))
      );
  }

  getStudentByBarCode(barCode: string): Observable<TeacherWithStudent> {
    this.loaderService.display(true);
    return this.http
      .get<TeacherWithStudent>(`${this.studentsUrl}/${barCode}`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(res => {
          this.loaderService.display(false);
          return res;
        }),
        catchError(err => this.handleObservableError<TeacherWithStudent>(err))
      );
  }

  getAllBooks(params: DataTableParams, searchParameters: BookSearchParameters): Observable<BookList> {
    return this.http
      .get<{ count: number, data: Book[]}>(`${this.booksUrl}?${this.paramsToQueryString(params, searchParameters)}`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(res => {
            return {
              count: res.count,
              books: res.data.map(Book.fromObject)
            }
        }),
        catchError(err => this.handleObservableError<BookList>(err))
      )
  }

  exportBooks(searchParameters: BookSearchParameters) {
    window.location.href = `${this.booksUrl}/exporttotab?${this.paramsToQueryString({}, searchParameters)}`;
  }

  paramsToQueryString(params: DataTableParams, searchParameters: BookSearchParameters): string {
    const result = [];

    if (params.offset) {
        result.push(['offset', params.offset]);
    }
    if (params.limit) {
        result.push(['pageSize', params.limit]);
    }
    if (searchParameters.title) {
        result.push(['title', searchParameters.title]);
    }
    if (searchParameters.author) {
      result.push(['author', searchParameters.author]);
    }
    if (searchParameters.boxNumber) {
      result.push(['boxNumber', searchParameters.boxNumber]);
    }
    if (searchParameters.bookBarCode) {
      result.push(['bookBarCode', searchParameters.bookBarCode]);
    }

    return result.map(param => param.join('=')).join('&');
  }

  addBook(book: Book): Observable<Book> {
    return this.http
      .post<{data: Book}>(`${this.booksUrl}`, JSON.stringify(book), {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => this.handleObservableError<Book>(err))
      )
  }

  updateBook(book: Book): Observable<Book> {
    return this.http
      .put<{data: Book}>(`${this.booksUrl}/${book.id}`, JSON.stringify(book), {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => this.handleObservableError<Book>(err))
      )
  }

  addBookCopy(bookId: string, barCode: string): Observable<Book> {
    return this.http
      .post<{data: Book}>(`${this.booksUrl}/${bookId}/bookcopy`, JSON.stringify({ barCode: barCode }), {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => this.handleObservableError<Book>(err))
      )
  }

  removeBookCopy(bookId: string, barCode: string): Observable<Book> {
    return this.http
      .delete<{data: Book}>(`${this.booksUrl}/${bookId}/bookcopy/${barCode}`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => this.handleObservableError<Book>(err))
      )
  }

  markBookCopyLost(bookId: string, barCode: string): Observable<Book> {
    return this.http
      .put<{data: Book}>(`${this.booksUrl}/${bookId}/bookcopy/${barCode}/marklost`, '', {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => this.handleObservableError<Book>(err))
      )
  }

  markBookCopyFound(bookId: string, barCode: string): Observable<Book> {
    return this.http
      .put<{data: Book}>(`${this.booksUrl}/${bookId}/bookcopy/${barCode}/markfound`, '', {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => this.handleObservableError<Book>(err))
      )
  }

  addCommentsToBookCopy(bookId: string, barCode: string, comments: string): Observable<Book> {
    return this.http
      .put<{data: Book}>(`${this.booksUrl}/${bookId}/bookcopy/${barCode}/comments`, JSON.stringify({ comments: comments }), {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => this.handleObservableError<Book>(err))
      )
  }

  markBookCopyDamaged(bookId: string, barCode: string): Observable<Book> {
    return this.http
      .put<{data: Book}>(`${this.booksUrl}/${bookId}/bookcopy/${barCode}/markdamaged`, '', {headers: this.getAuthHeaders(true)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => this.handleObservableError<Book>(err))
      )
  }

  getBook(bookId: string): Observable<Book> {
    return this.http
      .get<{data: Book}>(`${this.booksUrl}/${bookId}`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => {
          if (err.status === 404) {
            throw new Error("Book not found");
          }
          return this.handleObservableError<Book>(err);
        })
      )
  }

  getBookByIsbn(isbn: string): Observable<Book> {
    return this.http
      .get<{data: Book}>(`${this.booksUrl}/isbn/${isbn}`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(res => Book.fromObject(res.data)),
        catchError(err => {
          if (err.status === 404) {
            throw new Error("Book not found");
          }
          return this.handleObservableError<Book>(err);
        })
      )
  }

  getBookCopyByBarCode(barCode: string): Observable<BookCopyWithBook> {
    return this.http
      .get<BookCopyWithBook>(`${this.booksUrl}/bookcopies/${barCode}`, {headers: this.getAuthHeaders(false)});
  }

  checkOutBookForStudent(bookCopyBarCode: string, studentBarCode: string): Observable<BookCopyReservation> {
    const bookCopyReservation: BookCopyReservation = {
      bookCopyBarCode: bookCopyBarCode,
      studentBarCode: studentBarCode
    };
    this.loaderService.display(true);
    return this.http
      .post<BookCopyReservation>(`${this.bookCheckOutUrl}`, JSON.stringify(bookCopyReservation), {headers: this.getAuthHeaders(true)})
      .pipe(
        map(bcr => {
          this.loaderService.display(false);
          return bcr
        }),
        catchError(err => this.handleObservableError<BookCopyReservation>(err))
      )
  }

  checkInBookCopy(bookCopyBarCode: string): Observable<unknown> {
    this.loaderService.display(true);
    return this.http
    .post(`${this.bookCheckOutUrl}/checkin/${bookCopyBarCode}`, JSON.stringify({}), {headers: this.getAuthHeaders(true)})
    .pipe(
      map(resp => {
        this.loaderService.display(false);
        return resp;
      })
    )
  }

  getBookCopyReservations(studentId?: string, params?: DataTableParams, daysBack?: number
      , bookSearchParameters?: BookSearchParameters):
      Observable<{count: number, reservations: BookCopyReservationWithData[]}> {
    this.loaderService.display(true);
    const checkoutParams = this.bookCopyParamsToQueryString(params, studentId, studentId !== undefined, daysBack
      , false, bookSearchParameters);
    return this.http
      .get<{count: number, data: BookCopyReservationWithData[]}>(`${this.bookCheckOutUrl}${checkoutParams ? `?${checkoutParams}` : ''}`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(bcr => {
          this.loaderService.display(false);
          const result = bcr;
          return {
            count: result.count,
            reservations: result.data as BookCopyReservationWithData[]
          }
        }),
        catchError(err => this.handleObservableError<{count: number, reservations: BookCopyReservationWithData[]}>(err))
      )
  }

  getBookCopyReservationsForBookCopy(bookBarCode: string):
    Observable<{count: number, reservations: BookCopyReservationWithData[]}> {
    this.loaderService.display(true);
    return this.http
      .get<{count: number, data: BookCopyReservationWithData[]}>(`${this.bookCheckOutUrl}?bookBarCode=${bookBarCode}&fullHistory=true`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(bcr => {
          this.loaderService.display(false);
          const result = bcr;
          return {
            count: result.count,
            reservations: result.data as BookCopyReservationWithData[]
          }
        }),
        catchError(err => this.handleObservableError<{count: number, reservations: BookCopyReservationWithData[]}>(err))
      )
  }

  downloadBookCopyReservations(studentId?: string, params?: DataTableParams, daysBack?: number
      , bookSearchParameters?: BookSearchParameters):
      Observable<{ downloadLink: string}> {
    this.loaderService.display(true);
    const checkoutParams = this.bookCopyParamsToQueryString(params, studentId, studentId !== undefined, daysBack
      , true, bookSearchParameters);
    return this.http
    .get<{ downloadLink: string }>(`${this.bookCheckOutUrl}${checkoutParams ? `?${checkoutParams}` : ''}`, {headers: this.getAuthHeaders(false)})
    .pipe(
      map(bcr => {
        this.loaderService.display(false);
        const result = bcr as { downloadLink: string };
        return result;
      }),
      catchError(err => this.handleObservableError<{ downloadLink: string }>(err))
    )
  }

  bookCopyParamsToQueryString(params?: DataTableParams, studentId?: string, fullhistory?: boolean, daysBack?: number
    , exportAsTab?: boolean, bookSearchParameters?: BookSearchParameters): string {
    const result = [];

    if (params) {
      if (params.offset) {
          result.push(['offset', params.offset]);
      }
      if (params.limit) {
          result.push(['pageSize', params.limit]);
      }
      if (params.sortBy) {
          result.push(['sort', params.sortBy]);
      }
      if (params.sortAsc) {
          result.push(['order', params.sortAsc ? 'ASC' : 'DESC']);
      }
    }
    if (bookSearchParameters) {
      for (const key in bookSearchParameters) {
        if (Object.prototype.hasOwnProperty.call(bookSearchParameters, key)) {
          result.push([key, bookSearchParameters[key]]);
        }
      }
    }
    if (studentId) {
      result.push(['studentBarCode', studentId]);
    }
    if (fullhistory) {
      result.push(['fullhistory', 'true']);
    }
    if (daysBack) {
      result.push(['daysBack', daysBack]);
    }
    if (exportAsTab) {
      result.push(['exportAsTab', 'true']);
    }
    return result.map(param => param.join('=')).join('&');
  }

  getVolunteerLoginsSinceDate(daysBack: number): Observable<VolunteerWithLogons[]> {
    this.loaderService.display(true);
    return this.http
      .get<VolunteerWithLogons[]>(`${this.volunteersUrl}/logons?daysBack=${daysBack}`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(resp => {
          this.loaderService.display(false);
          return resp;
        }),
        catchError(err => this.handleObservableError<VolunteerWithLogons[]>(err))
      )
  }

  getClassStatistics(classId: string, monthId: string): Observable<ClassStatistics> {
    this.loaderService.display(true);
    return this.http
      .get<ClassStatistics>(`${this.classesUrl}/${classId}/stats?forMonth=${monthId}`, {headers: this.getAuthHeaders(false)})
      .pipe(
        map(val => {
          this.loaderService.display(false);
          return val;
        }),
        catchError(err => this.handleObservableError<ClassStatistics>(err))
      );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleObservableError<T>(err: HttpErrorResponse): Observable<T> {
    console.error('An error occurred', err);
    this.loaderService.display(false);
    throw new Error(JSON.stringify(err.error));
  }

}
