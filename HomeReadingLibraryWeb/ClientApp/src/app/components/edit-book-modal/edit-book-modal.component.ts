import { Component, EventEmitter, Output, ViewChild, TemplateRef, Renderer2, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Book } from '../../entities/book';

export type EditBookModalMode = 'edit' | 'add-copy';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  selector: 'app-edit-book-modal',
  templateUrl: './edit-book-modal.component.html',
  styleUrls: ['./edit-book-modal.component.css']
})
export class EditBookModalComponent implements OnInit {
  @Output() bookUpdated = new EventEmitter<Book>();
  @ViewChild('content') content: TemplateRef<any>;

  editBookForm: UntypedFormGroup;
  public modalRef: BsModalRef;
  mode: EditBookModalMode = 'edit';
  currentBook: Book;
  lastBookCopyValue: string;
  currentBookCopy: string;
  currentBookComment: string;
  public commentModalRef: BsModalRef;

  constructor(
    private fb: UntypedFormBuilder,
    private baggyBookService: BaggyBookService,
    private modalService: BsModalService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.editBookForm = this.fb.group({
      readingLevel: ['A'],
      boxNumber: ['1'],
      editTitle: [''],
      editAuthor: [''],
      bookCopyBarCode: ['']
    });
  }

  open(book: Book, mode: EditBookModalMode = 'edit'): void {
    if (!this.content) { return; }
    this.currentBook = book;
    this.mode = mode;
    this.initializeForm();
    this.modalRef = this.modalService.show(this.content);
    this.focusFirstField();
  }

  close(): void {
    this.resetForm();
    this.modalRef?.hide();
  }

  private initializeForm(): void {
    this.editBookForm.patchValue({
      readingLevel: this.currentBook.guidedReadingLevel,
      boxNumber: this.currentBook.boxNumber,
      editTitle: this.currentBook.title,
      editAuthor: this.currentBook.author,
      bookCopyBarCode: ''
    });
    this.lastBookCopyValue = '';
  }

  private resetForm(): void {
    this.editBookForm.reset();
    this.currentBook = null;
    this.lastBookCopyValue = '';
  }

  private focusFirstField(): void {
    setTimeout(() => {
      try {
        if (this.mode === 'edit') {
          this.renderer.selectRootElement('#editTitle').focus();
        } else {
          this.renderer.selectRootElement('#bookCopyBarCode').focus();
        }
      } catch { }
    }, 200);
  }

  updateBook(): void {
    this.baggyBookService.getBook(this.currentBook.id)
      .subscribe(book => {
        book.guidedReadingLevel = this.editBookForm.get('readingLevel').value;
        book.boxNumber = this.editBookForm.get('boxNumber').value;
        book.title = this.editBookForm.get('editTitle').value;
        book.author = this.editBookForm.get('editAuthor').value;
        this.baggyBookService.updateBook(book)
          .subscribe(() => {
            this.bookUpdated.emit(book);
            this.currentBook = book;
            this.close();
          });
      });
  }

  onBookCopyEntered(): void {
    const bookCopyInput = this.editBookForm.get('bookCopyBarCode');
    if (bookCopyInput.value !== '' && bookCopyInput.value !== this.lastBookCopyValue) {
      this.baggyBookService.addBookCopy(this.currentBook.id, bookCopyInput.value)
        .subscribe(book => {
          this.bookUpdated.emit(book);
          this.currentBook = book;
          setTimeout(() => bookCopyInput.setValue(''), 0);
        });
    } else {
      setTimeout(() => bookCopyInput.setValue(''), 0);
    }
    this.lastBookCopyValue = bookCopyInput.value;
  }

  removeBookCopy(barCode: string): void {
    if (window.confirm(`Are you sure you want to delete book copy ${barCode}?`)) {
      this.baggyBookService.removeBookCopy(this.currentBook.id, barCode)
        .subscribe(book => {
          this.bookUpdated.emit(book);
          this.currentBook = book;
        });
    }
  }

  markBookCopyLost(barCode: string): void {
    this.baggyBookService.markBookCopyLost(this.currentBook.id, barCode)
      .subscribe(book => {
        this.bookUpdated.emit(book);
        this.currentBook = book;
      });
  }

  markBookCopyFound(barCode: string): void {
    this.baggyBookService.markBookCopyFound(this.currentBook.id, barCode)
      .subscribe(book => {
        this.bookUpdated.emit(book);
        this.currentBook = book;
      });
  }

  markBookCopyDamaged(barCode: string): void {
    this.baggyBookService.markBookCopyDamaged(this.currentBook.id, barCode)
      .subscribe(book => {
        this.bookUpdated.emit(book);
        this.currentBook = book;
      });
  }

  addComments(content: TemplateRef<unknown>, bookBarCode: string, bookCopyComments: string): void {
    this.currentBookCopy = bookBarCode;
    this.currentBookComment = bookCopyComments;
    this.commentModalRef = this.modalService.show(content);
  }

  saveBookComment(): void {
    this.baggyBookService.addCommentsToBookCopy(this.currentBook.id, this.currentBookCopy, this.currentBookComment)
      .subscribe(book => {
        this.bookUpdated.emit(book);
        this.currentBook = book;
        this.commentModalRef.hide();
      });
  }
}
