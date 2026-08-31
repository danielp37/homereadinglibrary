import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { BookListComponent } from './book-list.component';
import { BaggyBookService } from '../../services/baggy-book.service';

describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getAllBooks']);
    mockBaggyBookService.getAllBooks.and.returnValue(of({ books: [], count: 0 }));

    TestBed.configureTestingModule({
      imports: [ BookListComponent ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });

    TestBed.overrideComponent(BookListComponent, {
      set: {
        imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
        providers: []
      }
    });

    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
