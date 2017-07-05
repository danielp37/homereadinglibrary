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
  private bookCheckOutUrl = '/api/bookcheckout'
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http, @Inject('ORIGIN_URL') private originUrl: string) { }

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

  getClasses(schoolYear: number): Promise<Class[]> {
    return this.http
      .get(`${this.originUrl}${this.classesUrl}?schoolYear=${schoolYear}`)
      .toPromise()
      .then(response => response.json().data as Class[])
      .catch(this.handleError);

  }

  getStudents(classId: string): Promise<Student[]> {
    return this.http
      .get(`${this.originUrl}${this.studentsUrl}?classId=${classId}`)
      .toPromise()
      .then(response => response.json().data as Student[])
      .catch(this.handleError);
  }

  addStudent(newStudent: Student): Promise<Student> {
    return this.http
      .post(`${this.originUrl}${this.studentsUrl}`, JSON.stringify(newStudent), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Student)
      .catch(this.handleError);
  }

  getStudentByBarCode(barCode: string): Promise<Student> {
    return this.http
      .get(`${this.originUrl}${this.studentsUrl}?barCode=${barCode}`)
      .toPromise()
      .then(res => res.json().data[0] as Student)
      .catch(this.handleError);
  }

  getAllBooks(): Promise<Book[]> {
    return this.http
      .get(`${this.originUrl}${this.booksUrl}`)
      .toPromise()
      .then(res => res.json().data as Book[])
      .catch(this.handleError);
  }

  addBook(book: Book): Promise<Book> {
    return this.http
      .post(`${this.originUrl}${this.booksUrl}`, JSON.stringify(book), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Book)
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

  getBookCopyByBarCode(barCode: number): Promise<BookCopy> {
    return this.getAllBooks()
      .then(books => {
        let bookCopy = undefined as BookCopy;
        books.forEach(book => {
          bookCopy = book.getBookCopy(barCode);
        });

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

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
