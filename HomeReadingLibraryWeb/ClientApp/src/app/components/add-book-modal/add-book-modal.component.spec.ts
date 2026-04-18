import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBookModalComponent } from './add-book-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { BaggyBookService } from '../../services/baggy-book.service';
import { of } from 'rxjs';
import { Book } from '../../entities/book';

describe('AddBookModalComponent', () => {
  let component: AddBookModalComponent;
  let fixture: ComponentFixture<AddBookModalComponent>;
  const baggyBookServiceStub = {
    addBook: jasmine.createSpy('addBook').and.returnValue(of(new Book()))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AddBookModalComponent, ReactiveFormsModule, ModalModule.forRoot() ],
      providers: [ { provide: BaggyBookService, useValue: baggyBookServiceStub }, BsModalService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBookModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty and valid when fields set', () => {
    expect(component.addBookForm.valid).toBeFalse();
    component.addBookForm.get('title').setValue('My Book');
    component.addBookForm.get('author').setValue('Author Name');
    expect(component.addBookForm.valid).toBeTrue();
  });

  it('save should call baggyBookService.addBook and emit bookAdded', (done) => {
    spyOn(component.bookAdded, 'emit');
    component.addBookForm.get('title').setValue('My Book');
    component.addBookForm.get('author').setValue('Author Name');

    component.save();

    setTimeout(() => {
      expect(baggyBookServiceStub.addBook).toHaveBeenCalled();
      expect(component.bookAdded.emit).toHaveBeenCalled();
      done();
    }, 10);
  });

});
