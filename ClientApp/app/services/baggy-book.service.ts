import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Component, Inject } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { Volunteer } from '../entities/Volunteer';
import { Class } from '../entities/class';
import { Student } from '../entities/student';
import { Book } from '../entities/book';

@Injectable()
export class BaggyBookService {
  private studentsUrl = '/api/students';
  private volunteersUrl = '/api/volunteers'
  private classesUrl = '/api/classes'
  private booksUrl = '/api/books'
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

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
