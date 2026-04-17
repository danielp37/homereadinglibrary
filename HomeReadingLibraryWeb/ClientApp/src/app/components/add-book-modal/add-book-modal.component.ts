import { Component, EventEmitter, Output, ViewChild, TemplateRef, Renderer2, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Book } from '../../entities/book';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-add-book-modal',
  templateUrl: './add-book-modal.component.html',
  styleUrls: ['./add-book-modal.component.css']
})
export class AddBookModalComponent implements OnInit {
  @Output() bookAdded = new EventEmitter<Book>();
  @ViewChild('content') content: TemplateRef<any>;

  addBookForm: UntypedFormGroup;
  public modalRef: BsModalRef;

  constructor(
    private fb: UntypedFormBuilder,
    private baggyBookService: BaggyBookService,
    private modalService: BsModalService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.addBookForm = this.fb.group({
      isbn: [''],
      title: ['', Validators.required],
      author: ['', Validators.required],
      guidedReadingLevel: [''],
      boxNumber: ['']
    });
  }

  open(): void {
    if (!this.content) { return; }
    this.modalRef = this.modalService.show(this.content);
    setTimeout(() => {
      try { this.renderer.selectRootElement('#addBookTitle').focus(); } catch { }
    }, 200);
  }

  close(): void {
    this.modalRef?.hide();
  }

  save(): void {
    if (this.addBookForm.invalid) { return; }
    const book = new Book();
    book.isbn = this.addBookForm.get('isbn').value;
    book.title = this.addBookForm.get('title').value;
    book.author = this.addBookForm.get('author').value;
    book.guidedReadingLevel = this.addBookForm.get('guidedReadingLevel').value;
    book.boxNumber = this.addBookForm.get('boxNumber').value;
    book.createdDate = undefined;

    this.baggyBookService.addBook(book).subscribe({
      next: (b) => {
        this.bookAdded.emit(b);
        this.close();
      },
      error: () => {
        // keep modal open and optionally surface error via UI in future
      }
    });
  }
}
