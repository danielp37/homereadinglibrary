import { BookSearchParameters } from './Book-Search-Parameters';
import { BookList } from './../entities/book-list';
import {DataTableParams} from 'angular-2-data-table';
import { BookCopyReservation } from './../entities/book-copy-reservation';
import { Student } from './../entities/student';
import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Component, Inject } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { Volunteer } from '../entities/Volunteer';
import { Class } from '../entities/class';
import { Book } from '../entities/book';
import { BookCopy } from '../entities/book-copy';

@Injectable()
export class BaggyBookService {
  private studentsUrl = '/api/students';
  private volunteersUrl = '/api/volunteers'
  private classesUrl = '/api/classes'
  private booksUrl = '/api/books'
  private bookCheckOutUrl = '/api/bookcopyreservations'
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http,
    @Inject('ORIGIN_URL') private originUrl: string) { }

  createVolunteer(volunteer: Volunteer): Promise<Volunteer> {
    return this.http
      .post(`${this.originUrl}${this.volunteersUrl}`, JSON.stringify(volunteer), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Volunteer)
      .catch(this.handleError);
  }

  getVolunteers(): Promise<Volunteer[]> {
    return this.http
      .get(`${this.originUrl}${this.volunteersUrl}`)
      .toPromise()
      .then(response => response.json().data as Volunteer[])
      .catch(this.handleError);
  }

  getClasses(): Promise<Class[]> {
    return this.http
      .get(`${this.originUrl}${this.classesUrl}`)
      .toPromise()
      .then(response => response.json().data.map(Class.fromObject))
      .catch(this.handleError);

  }

  addClass(teacherName: string, grade: number): Promise<Class> {
    return this.http
      .post(`${this.originUrl}${this.classesUrl}`, JSON.stringify({teacherName: teacherName, grade: grade}), {headers: this.headers})
      .toPromise()
      .then(res => Class.fromObject(res.json().data))
      .catch(this.handleError);
  }

  getStudents(classId: string): Promise<Student[]> {
    return this.http
      .get(`${this.originUrl}${this.classesUrl}/${classId}/students`)
      .toPromise()
      .then(response => response.json().data as Student[])
      .catch(this.handleError);
  }

  addStudent(classId: string, newStudent: Student): Promise<Class> {
    return this.http
      .post(`${this.originUrl}${this.classesUrl}/${classId}/students`, JSON.stringify(newStudent), {headers: this.headers})
      .toPromise()
      .then(res => Class.fromObject(res.json().data))
      .catch(this.handleError);
  }

  getStudentByBarCode(barCode: string): Promise<Student> {
    return this.http
      .get(`${this.originUrl}${this.studentsUrl}?barCode=${barCode}`)
      .toPromise()
      .then(res => res.json().data[0] as Student)
      .catch(this.handleError);
  }

  getAllBooks(params: DataTableParams, searchParameters: BookSearchParameters): Promise<BookList> {
    return this.http
      .get(`${this.originUrl}${this.booksUrl}?${this.paramsToQueryString(params, searchParameters)}`)
      .toPromise()
      .then(res => {
        const obj = res.json();
        return {
          count: obj.count,
          books: obj.data.map(Book.fromObject)
        }
      })
      .catch(this.handleError);
  }

  exportBooks(searchParameters: BookSearchParameters) {
    window.location.href = `${this.originUrl}${this.booksUrl}/exporttotab?${this.paramsToQueryString({}, searchParameters)}`;
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
        result.push(['title', searchParameters.title])
    }
    if (searchParameters.author) {
      result.push(['author', searchParameters.author])
    }
    if (searchParameters.boxNumber) {
      result.push(['boxNumber', searchParameters.boxNumber])
    }
// if (params.sortBy != null) {
    //     result.push(['_sort', params.sortBy]);
    // }
    // if (params.sortAsc != null) {
    //     result.push(['_order', params.sortAsc ? 'ASC' : 'DESC']);
    // }

    return result.map(param => param.join('=')).join('&');
  }

  addBook(book: Book): Promise<Book> {
    return this.http
      .post(`${this.originUrl}${this.booksUrl}`, JSON.stringify(book), {headers: this.headers})
      .toPromise()
      .then(res => Book.fromObject(res.json().data))
      .catch(this.handleError);
  }

  updateBook(book: Book): Promise<Book> {
    return this.http
      .put(`${this.originUrl}${this.booksUrl}/${book.id}`, JSON.stringify(book), {headers: this.headers})
      .toPromise()
      .then(res => Book.fromObject(res.json().data))
      .catch(this.handleError);
  }

  addBookCopy(bookId: string, barCode: string): Promise<Book> {
    return this.http
      .post(`${this.originUrl}${this.booksUrl}/${bookId}/bookcopy`, JSON.stringify({ barCode: barCode }), {headers: this.headers})
      .toPromise()
      .then(book => Book.fromObject(book.json().data))
      .catch(this.handleError);
  }

  removeBookCopy(bookId: string, barCode: string): Promise<Book> {
    return this.http
      .delete(`${this.originUrl}${this.booksUrl}/${bookId}/bookcopy/${barCode}`)
      .toPromise()
      .then(book => Book.fromObject(book.json().data))
      .catch(this.handleError);
  }

  getBook(bookId: string): Promise<Book> {
    return this.http
      .get(`${this.originUrl}${this.booksUrl}/${bookId}`)
      .toPromise()
      .then(book => Book.fromObject(book.json().data))
      .catch(error => {
        if (error.status === 404) {
          return Promise.reject('Book not found');
        }
        return this.handleError(error);
      });
  }

  getBookByIsbn(isbn: string): Promise<Book> {
    return this.http
      .get(`${this.originUrl}${this.booksUrl}/isbn/${isbn}`)
      .toPromise()
      .then(book => Book.fromObject(book.json().data))
      .catch(error => {
        if (error.status === 404) {
          return Promise.reject('Book not found');
        }
        return this.handleError(error);
      });
  }

  getBookCopyByBarCode(barCode: string): Promise<BookCopy> {
    return this.http
      .get(`${this.originUrl}${this.booksUrl}?barcode=${barCode}`)
      .toPromise()
      .then(books => {
        const bookCopy = undefined as BookCopy;
        // books.forEach(book => {
        //   bookCopy = book.getBookCopy(barCode);
        // });

        return bookCopy;
      })

  }

  checkOutBookForStudent(bookCopyId: string, studentId: string): Promise<BookCopyReservation> {
    const bookCopyReservation = new BookCopyReservation(bookCopyId, studentId, new Date(Date.now()));

    return this.http
      .post(`${this.originUrl}${this.bookCheckOutUrl}`, JSON.stringify(bookCopyReservation), {headers: this.headers})
      .toPromise()
      .then(bcr => bcr.json().data as BookCopyReservation);
  }

  getBookCopyReservations(): Promise<BookCopyReservation[]> {
    return this.http
      .get(`${this.originUrl}${this.bookCheckOutUrl}`)
      .toPromise()
      .then(bcr => bcr.json().data as BookCopyReservation[]);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
