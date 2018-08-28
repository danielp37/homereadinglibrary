import { VolunteerWithLogons } from './../entities/volunteer-with-logons';
import { LoaderService } from './loader.service';
// import { AuthHttp } from 'angular2-jwt';
import { AuthService } from './../modules/app-auth/services/auth.service';
import { JwtResponse } from './../entities/jwt-response';
import { ClassWithVolunteers } from './../entities/class-with-volunteers';
import { BookCopyReservationWithData } from './../entities/book-copy-reservation-with-data';
import { BookCopyWithBook } from './../entities/book-copy-with-book';
import { StudentWithTeacher } from './../entities/student-with-teacher';
// import { BookSearchParameters } from './Book-Search-Parameters';
import { BookList } from './../entities/book-list';
// import { DataTableParams } from 'angular-2-data-table';
import { BookCopyReservation } from './../entities/book-copy-reservation';
import { Student } from './../entities/student';
import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Component, Inject } from '@angular/core';

import { Volunteer } from '../entities/Volunteer';
import { Class } from '../entities/class';
import { Book } from '../entities/book';
import { BookCopy } from '../entities/book-copy';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

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
  private headers = new HttpHeaders({'Content-Type': 'application/json'});

  constructor(private http: HttpClient,
    // @Inject('ORIGIN_URL') private originUrl: string,
    private authService: AuthService,
    private oauthService: OAuthService,
    // private authHttp: AuthHttp,
    private loaderService: LoaderService) { }

  private getAuthHeaders(includeContentType: boolean) : HttpHeaders {
    const authHeader = new HttpHeaders({
      "Authorization": "Bearer " + this.oauthService.getAccessToken()
    });
    if(includeContentType) {
      authHeader.append("Content-Type", "application/json");
    }
    return authHeader;
  }

  createVolunteer(volunteer: Volunteer): Promise<Volunteer> {
    return this.http
      .post<Volunteer>(`${this.volunteersUrl}`, JSON.stringify(volunteer), {headers: this.headers})
      .toPromise()
      .catch(error => this.handleError(error));
  }

  getVolunteers(): Promise<Volunteer[]> {
    return this.http
      .get<Volunteer[]>(`${this.volunteersUrl}`)
      .toPromise()
      .catch(error => this.handleError(error));
  }

  getClasses(): Promise<Class[]> {
    return this.http
      .get<object[]>(`${this.classesUrl}`)
      .toPromise()
      .then(response => response.map(Class.fromObject))
      .catch(error => this.handleError(error));

  }



  getClassesWithVolunteers(): Promise<ClassWithVolunteers[]> {
    this.loaderService.display(true);
    return this.http
    .get<ClassWithVolunteersResult>(`${this.volunteersUrl}/byclass`)
    .toPromise()
    .then(response => {
      this.loaderService.display(false);
      return response.data;
    })
    .catch(error => this.handleError(error));
  }

  // addClass(teacherName: string, grade: number): Promise<Class> {
  //   return this.authHttp
  //     .post(`${this.originUrl}${this.classesUrl}`, JSON.stringify({teacherName: teacherName, grade: grade}), {headers: this.headers})
  //     .toPromise()
  //     .then(res => Class.fromObject(res.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // getStudents(classId: string): Promise<Student[]> {
  //   return this.authHttp
  //     .get(`${this.originUrl}${this.classesUrl}/${classId}/students`)
  //     .toPromise()
  //     .then(response => response.json().data as Student[])
  //     .catch(error => this.handleError(error));
  // }

  // addStudent(classId: string, newStudent: Student): Promise<Class> {
  //   return this.authHttp
  //     .post(`${this.originUrl}${this.classesUrl}/${classId}/students`, JSON.stringify(newStudent), {headers: this.headers})
  //     .toPromise()
  //     .then(res => Class.fromObject(res.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // addNewStudent(classId: string, newStudent: Student): Promise<Class> {
  //   return this.authHttp
  //     .post(`${this.originUrl}${this.classesUrl}/${classId}/newstudent`, JSON.stringify(newStudent), {headers: this.headers})
  //     .toPromise()
  //     .then(res => Class.fromObject(res.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // getStudentByBarCode(barCode: string): Promise<StudentWithTeacher> {
  //   this.loaderService.display(true);
  //   return this.authHttp
  //     .get(`${this.originUrl}${this.studentsUrl}/${barCode}`)
  //     .toPromise()
  //     .then(res => {
  //       this.loaderService.display(false);
  //       return res.json() as StudentWithTeacher
  //     })
  //     .catch(error => this.handleError(error));
  // }

  // getAllBooks(params: DataTableParams, searchParameters: BookSearchParameters): Promise<BookList> {
  //   return this.authHttp
  //     .get(`${this.originUrl}${this.booksUrl}?${this.paramsToQueryString(params, searchParameters)}`)
  //     .toPromise()
  //     .then(res => {
  //       const obj = res.json();
  //       return {
  //         count: obj.count,
  //         books: obj.data.map(Book.fromObject)
  //       }
  //     })
  //     .catch(error => this.handleError(error));
  // }

  // exportBooks(searchParameters: BookSearchParameters) {
  //   window.location.href = `${this.originUrl}${this.booksUrl}/exporttotab?${this.paramsToQueryString({}, searchParameters)}`;
  // }

  // paramsToQueryString(params: DataTableParams, searchParameters: BookSearchParameters): string {
  //   const result = [];

  //   if (params.offset) {
  //       result.push(['offset', params.offset]);
  //   }
  //   if (params.limit) {
  //       result.push(['pageSize', params.limit]);
  //   }
  //   if (searchParameters.title) {
  //       result.push(['title', searchParameters.title]);
  //   }
  //   if (searchParameters.author) {
  //     result.push(['author', searchParameters.author]);
  //   }
  //   if (searchParameters.boxNumber) {
  //     result.push(['boxNumber', searchParameters.boxNumber]);
  //   }
  //   if (searchParameters.bookBarCode) {
  //     result.push(['bookBarCode', searchParameters.bookBarCode]);
  //   }

  //   return result.map(param => param.join('=')).join('&');
  // }

  // addBook(book: Book): Promise<Book> {
  //   return this.authHttp
  //     .post(`${this.originUrl}${this.booksUrl}`, JSON.stringify(book), {headers: this.headers})
  //     .toPromise()
  //     .then(res => Book.fromObject(res.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // updateBook(book: Book): Promise<Book> {
  //   return this.authHttp
  //     .put(`${this.originUrl}${this.booksUrl}/${book.id}`, JSON.stringify(book), {headers: this.headers})
  //     .toPromise()
  //     .then(res => Book.fromObject(res.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // addBookCopy(bookId: string, barCode: string): Promise<Book> {
  //   return this.authHttp
  //     .post(`${this.originUrl}${this.booksUrl}/${bookId}/bookcopy`, JSON.stringify({ barCode: barCode }), {headers: this.headers})
  //     .toPromise()
  //     .then(book => Book.fromObject(book.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // removeBookCopy(bookId: string, barCode: string): Promise<Book> {
  //   return this.authHttp
  //     .delete(`${this.originUrl}${this.booksUrl}/${bookId}/bookcopy/${barCode}`)
  //     .toPromise()
  //     .then(book => Book.fromObject(book.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // markBookCopyLost(bookId: string, barCode: string): Promise<Book> {
  //   return this.authHttp
  //     .put(`${this.originUrl}${this.booksUrl}/${bookId}/bookcopy/${barCode}/marklost`, '', {headers: this.headers})
  //     .toPromise()
  //     .then(book => Book.fromObject(book.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // markBookCopyDamaged(bookId: string, barCode: string): Promise<Book> {
  //   return this.authHttp
  //     .put(`${this.originUrl}${this.booksUrl}/${bookId}/bookcopy/${barCode}/markdamaged`, '', {headers: this.headers})
  //     .toPromise()
  //     .then(book => Book.fromObject(book.json().data))
  //     .catch(error => this.handleError(error));
  // }

  // getBook(bookId: string): Promise<Book> {
  //   return this.authHttp
  //     .get(`${this.originUrl}${this.booksUrl}/${bookId}`)
  //     .toPromise()
  //     .then(book => Book.fromObject(book.json().data))
  //     .catch(error => {
  //       if (error.status === 404) {
  //         return Promise.reject('Book not found');
  //       }
  //       return this.handleError(error);
  //     });
  // }

  // getBookByIsbn(isbn: string): Promise<Book> {
  //   return this.authHttp
  //     .get(`${this.originUrl}${this.booksUrl}/isbn/${isbn}`)
  //     .toPromise()
  //     .then(book => Book.fromObject(book.json().data))
  //     .catch(error => {
  //       if (error.status === 404) {
  //         return Promise.reject('Book not found');
  //       }
  //       return this.handleError(error);
  //     });
  // }

  getBookCopyByBarCode(barCode: string): Promise<BookCopyWithBook> {
    return this.http
      .get<BookCopyWithBook>(`${this.booksUrl}/bookcopies/${barCode}`, {headers: this.getAuthHeaders(false)})
      .toPromise();
  }

  // checkOutBookForStudent(bookCopyBarCode: string, studentBarCode: string): Promise<BookCopyReservation> {
  //   const bookCopyReservation: BookCopyReservation = {
  //     bookCopyBarCode: bookCopyBarCode,
  //     studentBarCode: studentBarCode
  //   };
  //   this.loaderService.display(true);
  //   return this.authHttp
  //     .post(`${this.originUrl}${this.bookCheckOutUrl}`, JSON.stringify(bookCopyReservation), {headers: this.headers})
  //     .toPromise()
  //     .then(bcr => {
  //       this.loaderService.display(false);
  //       return bcr.json().data as BookCopyReservation
  //     });
  // }

  checkInBookCopy(bookCopyBarCode: string): Promise<any> {
    this.loaderService.display(true);
    return this.http
    .post(`${this.bookCheckOutUrl}/checkin/${bookCopyBarCode}`, JSON.stringify({}), {headers: this.getAuthHeaders(true)})
    .toPromise()
    .then(resp => {
      this.loaderService.display(false);
      return resp;
    });
  }

  // getBookCopyReservations(studentId?: string, params?: DataTableParams, daysBack?: number
  //     , bookSearchParameters?: BookSearchParameters):
  //     Promise<{count: number, reservations: BookCopyReservationWithData[]}> {
  //   this.loaderService.display(true);
  //   const checkoutParams = this.bookCopyParamsToQueryString(params, studentId, studentId !== undefined, daysBack
  //     , false, bookSearchParameters);
  //   return this.authHttp
  //     .get(`${this.originUrl}${this.bookCheckOutUrl}${checkoutParams ? `?${checkoutParams}` : ''}`)
  //     .toPromise()
  //     .then(bcr => {
  //       this.loaderService.display(false);
  //       const result = bcr.json();
  //       return {
  //         count: result.count,
  //         reservations: result.data as BookCopyReservationWithData[]
  //       }
  //     })
  //     .catch(error => this.handleError(error));
  // }

  // getBookCopyReservationsForBookCopy(bookBarCode: string):
  //   Promise<{count: number, reservations: BookCopyReservationWithData[]}> {
  //   this.loaderService.display(true);
  //   return this.authHttp
  //     .get(`${this.originUrl}${this.bookCheckOutUrl}?bookBarCode=${bookBarCode}&fullHistory=true`)
  //     .toPromise()
  //     .then(bcr => {
  //       this.loaderService.display(false);
  //       const result = bcr.json();
  //       return {
  //         count: result.count,
  //         reservations: result.data as BookCopyReservationWithData[]
  //       }
  //     })
  //     .catch(error => this.handleError(error));
  // }

  // downloadBookCopyReservations(studentId?: string, params?: DataTableParams, daysBack?: number
  //     , bookSearchParameters?: BookSearchParameters):
  //     Promise<{ downloadLink: string}> {
  //   this.loaderService.display(true);
  //   const checkoutParams = this.bookCopyParamsToQueryString(params, studentId, studentId !== undefined, daysBack
  //     , true, bookSearchParameters);
  //   return this.authHttp
  //   .get(`${this.originUrl}${this.bookCheckOutUrl}${checkoutParams ? `?${checkoutParams}` : ''}`)
  //   .toPromise()
  //   .then(bcr => {
  //     this.loaderService.display(false);
  //     const result = bcr.json() as { downloadLink: string };
  //     return result;
  //   })
  //   .catch(error => this.handleError(error));

  // }

  // bookCopyParamsToQueryString(params?: DataTableParams, studentId?: string, fullhistory?: boolean, daysBack?: number
  //   , exportAsTab?: boolean, bookSearchParameters?: BookSearchParameters): string {
  //   const result = [];

  //   if (params) {
  //     if (params.offset) {
  //         result.push(['offset', params.offset]);
  //     }
  //     if (params.limit) {
  //         result.push(['pageSize', params.limit]);
  //     }
  //     if (params.sortBy) {
  //         result.push(['sort', params.sortBy]);
  //     }
  //     if (params.sortAsc) {
  //         result.push(['order', params.sortAsc ? 'ASC' : 'DESC']);
  //     }
  //   }
  //   if (bookSearchParameters) {
  //     for (const key in bookSearchParameters) {
  //       if (bookSearchParameters.hasOwnProperty(key)) {
  //         result.push([key, bookSearchParameters[key]]);
  //       }
  //     }
  //   }
  //   if (studentId) {
  //     result.push(['studentBarCode', studentId]);
  //   }
  //   if (fullhistory) {
  //     result.push(['fullhistory', 'true']);
  //   }
  //   if (daysBack) {
  //     result.push(['daysBack', daysBack]);
  //   }
  //   if (exportAsTab) {
  //     result.push(['exportAsTab', 'true']);
  //   }
  //   return result.map(param => param.join('=')).join('&');
  // }

  loginVolunteer(volunteerId: string): Promise<boolean> {
    this.loaderService.display(true);
    return this.http
      .post<JwtResponse>(`${this.volunteersUrl}/jwtlogin`, JSON.stringify({ volunteerId: volunteerId}), {headers: this.headers})
      .toPromise()
      .then(jwtResponse => {
        this.loaderService.display(false);
        return this.authService.logInWithJwtToken(jwtResponse.id, jwtResponse.auth_token);
      })
      .catch(error => this.handleError(error));

  }

  loginAdmin(username: string, password: string): Promise<boolean> {
    this.loaderService.display(true);
    return this.http
      .post<JwtResponse>(`${this.volunteersUrl}/jwtlogin`,
        JSON.stringify({ username: username, password: password}), {headers: this.headers})
      .toPromise()
      .then(jwtResponse => {
        this.loaderService.display(false);
        return this.authService.logInWithJwtToken(jwtResponse.id, jwtResponse.auth_token);
      })
      .catch(error => this.handleError(error));

  }

  // getVolunteerLoginsSinceDate(daysBack: number): Promise<VolunteerWithLogons[]> {
  //   this.loaderService.display(true);
  //   return this.authHttp
  //     .get(`${this.originUrl}${this.volunteersUrl}/logons?daysBack=${daysBack}`)
  //     .toPromise()
  //     .then(resp => {
  //       this.loaderService.display(false);
  //       return resp.json() as VolunteerWithLogons[];
  //     })
  //     .catch(error => this.handleError(error));
  // }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    this.loaderService.display(false);
    return Promise.reject(error.message || error);
  }
}
