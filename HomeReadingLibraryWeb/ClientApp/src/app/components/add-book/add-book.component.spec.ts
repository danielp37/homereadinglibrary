import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddBookComponent } from './add-book.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { BookLookupService } from '../../services/book-lookup.service';
import { BsModalService } from 'ngx-bootstrap/modal';

describe('AddBookComponent', () => {
  let component: AddBookComponent;
  let fixture: ComponentFixture<AddBookComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AddBookComponent ],
      providers: [
        { provide: BaggyBookService, useValue: jasmine.createSpyObj('BaggyBookService', ['getBookByIsbn', 'addBook', 'addBookCopy', 'removeBookCopy', 'getBook', 'updateBook', 'markBookCopyLost', 'markBookCopyFound', 'markBookCopyDamaged', 'addCommentsToBookCopy']) },
        { provide: BookLookupService, useValue: jasmine.createSpyObj('BookLookupService', ['getBookFromIsbn']) },
        { provide: BsModalService, useValue: jasmine.createSpyObj('BsModalService', ['show']) }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
