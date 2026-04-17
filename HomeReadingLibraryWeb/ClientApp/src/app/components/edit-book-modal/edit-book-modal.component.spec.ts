import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditBookModalComponent } from './edit-book-modal.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Book } from '../../entities/book';
import { of } from 'rxjs';

describe('EditBookModalComponent', () => {
  let component: EditBookModalComponent;
  let fixture: ComponentFixture<EditBookModalComponent>;
  let mockBaggyBookService: jasmine.SpyObj<BaggyBookService>;
  let mockModalService: jasmine.SpyObj<BsModalService>;

  beforeEach(async () => {
    mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', [
      'addBookCopy',
      'removeBookCopy',
      'markBookCopyLost',
      'markBookCopyFound',
      'markBookCopyDamaged',
      'addCommentsToBookCopy',
      'getBook',
      'updateBook'
    ]);
    mockModalService = jasmine.createSpyObj('BsModalService', ['show']);

    await TestBed.configureTestingModule({
      imports: [EditBookModalComponent],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService },
        { provide: BsModalService, useValue: mockModalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditBookModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.editBookForm).toBeDefined();
    expect(component.editBookForm.get('readingLevel').value).toBe('A');
    expect(component.editBookForm.get('boxNumber').value).toBe('1');
  });

  it('should set mode to edit when opened in edit mode', () => {
    const mockBook = new Book();
    mockBook.id = 'test-id';
    mockBook.title = 'Test Book';
    mockBook.author = 'Test Author';
    mockBook.guidedReadingLevel = 'B';
    mockBook.boxNumber = '3';

    component.open(mockBook, 'edit');

    expect(component.mode).toBe('edit');
    expect(component.currentBook).toEqual(mockBook);
    expect(component.editBookForm.get('editTitle').value).toBe('Test Book');
    expect(component.editBookForm.get('editAuthor').value).toBe('Test Author');
  });

  it('should set mode to add-copy when opened in add-copy mode', () => {
    const mockBook = new Book();
    mockBook.id = 'test-id';
    mockBook.title = 'Test Book';
    mockBook.author = 'Test Author';

    component.open(mockBook, 'add-copy');

    expect(component.mode).toBe('add-copy');
    expect(component.currentBook).toEqual(mockBook);
  });

  it('should emit bookUpdated when book is updated', (done) => {
    const mockBook = new Book();
    mockBook.id = 'test-id';
    mockBook.title = 'Original Title';
    mockBook.author = 'Original Author';
    mockBook.guidedReadingLevel = 'A';
    mockBook.boxNumber = '1';

    mockBaggyBookService.getBook.and.returnValue(of(mockBook));
    mockBaggyBookService.updateBook.and.returnValue(of(void 0));

    component.currentBook = mockBook;
    component.editBookForm.patchValue({
      editTitle: 'Updated Title',
      editAuthor: 'Updated Author',
      readingLevel: 'B',
      boxNumber: '2'
    });

    component.bookUpdated.subscribe((updatedBook) => {
      expect(updatedBook.title).toBe('Updated Title');
      done();
    });

    component.updateBook();
  });

  it('should add book copy when barcode is entered', (done) => {
    const mockBook = new Book();
    mockBook.id = 'test-id';
    mockBook.bookCopies = [];
    const updatedBook = new Book();
    updatedBook.id = 'test-id';
    updatedBook.bookCopies = [{ barCode: 'BC123456' } as any];

    component.currentBook = mockBook;
    component.editBookForm.patchValue({ bookCopyBarCode: 'BC123456' });

    mockBaggyBookService.addBookCopy.and.returnValue(of(updatedBook));

    component.bookUpdated.subscribe((book) => {
      expect(book.bookCopyCount).toBe(1);
      done();
    });

    component.onBookCopyEntered();
  });

  it('should remove book copy when requested', (done) => {
    const mockBook = new Book();
    mockBook.id = 'test-id';
    const barCode = 'BC123456';
    const updatedBook = new Book();
    updatedBook.id = 'test-id';
    updatedBook.bookCopies = [];

    component.currentBook = mockBook;
    mockBaggyBookService.removeBookCopy.and.returnValue(of(updatedBook));
    spyOn(window, 'confirm').and.returnValue(true);

    component.bookUpdated.subscribe(() => {
      expect(mockBaggyBookService.removeBookCopy).toHaveBeenCalledWith(mockBook.id, barCode);
      done();
    });

    component.removeBookCopy(barCode);
  });

  it('should mark book copy as lost', (done) => {
    const mockBook = new Book();
    mockBook.id = 'test-id';
    const barCode = 'BC123456';
    const updatedBook = new Book();
    updatedBook.id = 'test-id';
    updatedBook.bookCopies = [];

    component.currentBook = mockBook;
    mockBaggyBookService.markBookCopyLost.and.returnValue(of(updatedBook));

    component.bookUpdated.subscribe(() => {
      expect(mockBaggyBookService.markBookCopyLost).toHaveBeenCalledWith(mockBook.id, barCode);
      done();
    });

    component.markBookCopyLost(barCode);
  });

  it('should reset form on close', () => {
    const mockBook = new Book();
    mockBook.id = 'test-id';
    component.currentBook = mockBook;

    component.close();

    expect(component.currentBook).toBeNull();
    expect(component.editBookForm.get('editTitle').value).toBeNull();
  });
});
