import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BookCopyCountReportComponent } from './book-copy-count-report.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { of, throwError } from 'rxjs';
import { BookCopyCountReportItem } from '../../entities/book-copy-count-report-item';

describe('BookCopyCountReportComponent', () => {
  let component: BookCopyCountReportComponent;
  let fixture: ComponentFixture<BookCopyCountReportComponent>;
  let mockBaggyBookService: jasmine.SpyObj<BaggyBookService>;

  const mockReportData: BookCopyCountReportItem[] = [
    {
      bookId: '1',
      title: 'The Cat in the Hat',
      author: 'Dr. Seuss',
      publisherText: 'Random House',
      guidedReadingLevel: 'B',
      isbn: '9780394800011',
      boxNumber: '12',
      bookCopyCount: 3
    },
    {
      bookId: '2',
      title: 'Green Eggs and Ham',
      author: 'Dr. Seuss',
      publisherText: 'Random House',
      guidedReadingLevel: 'C',
      isbn: '9780394800165',
      boxNumber: '7',
      bookCopyCount: 8
    }
  ];

  beforeEach(waitForAsync(() => {
    mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', [
      'getBookCopyCountsReport',
      'exportBookCopyCountsReport'
    ]);
    mockBaggyBookService.getBookCopyCountsReport.and.returnValue(of(mockReportData));
    mockBaggyBookService.exportBookCopyCountsReport.and.returnValue(of(new Blob(['test'], { type: 'text/csv' })));

    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL');

    TestBed.configureTestingModule({
      declarations: [ BookCopyCountReportComponent ],
      imports: [ CommonModule ],
      providers: [ { provide: BaggyBookService, useValue: mockBaggyBookService } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCopyCountReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not load data on init — report requires user to click Run Report', () => {
    expect(mockBaggyBookService.getBookCopyCountsReport).not.toHaveBeenCalled();
    expect(component.rows).toEqual([]);
    expect(component.hasRun).toBeFalse();
  });

  it('should load data and set hasRun when runReport is called', (done) => {
    component.runReport();

    setTimeout(() => {
      expect(mockBaggyBookService.getBookCopyCountsReport).toHaveBeenCalled();
      expect(component.rows).toEqual(mockReportData);
      expect(component.loading).toBe(false);
      expect(component.hasRun).toBeTrue();
      done();
    }, 10);
  });

  it('should set hasRun and loading to false on error', (done) => {
    mockBaggyBookService.getBookCopyCountsReport.and.returnValue(
      throwError(() => new Error('Failed to load'))
    );

    component.runReport();

    setTimeout(() => {
      expect(component.rows).toEqual([]);
      expect(component.loading).toBe(false);
      expect(component.hasRun).toBeTrue();
      done();
    }, 10);
  });

  it('should call exportBookCopyCountsReport and trigger download when exportCSV is called', (done) => {
    component.exportCSV();

    setTimeout(() => {
      expect(mockBaggyBookService.exportBookCopyCountsReport).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
      expect(component.exporting).toBeFalse();
      done();
    }, 10);
  });

  describe('DOM rendering', () => {
    let domFixture: ComponentFixture<BookCopyCountReportComponent>;
    let domComponent: BookCopyCountReportComponent;

    beforeEach(() => {
      domFixture = TestBed.createComponent(BookCopyCountReportComponent);
      domComponent = domFixture.componentInstance;
      domComponent.rows = [...mockReportData];
      domComponent.hasRun = true;
      domComponent.loading = false;
    });

    it('should render Title, Author, and Copy Count column headers when data is present', () => {
      domFixture.detectChanges();
      const compiled: HTMLElement = domFixture.nativeElement;
      const headers = Array.from(compiled.querySelectorAll('th')).map(th => th.textContent?.trim());
      expect(headers).toContain('Title');
      expect(headers).toContain('Author');
      expect(headers.some(h => h?.startsWith('Copy Count'))).toBeTrue();
    });
  });

  describe('sorting', () => {
    it('should have sortColumn as empty string and sortDirection as asc initially', () => {
      expect(component.sortColumn).toBe('');
      expect(component.sortDirection).toBe('asc');
    });

    it('should set sortColumn when sort() is called', () => {
      component.sort('bookCopyCount');
      expect(component.sortColumn).toBe('bookCopyCount');
    });

    it('should default to asc direction on first sort of a column', () => {
      component.sort('bookCopyCount');
      expect(component.sortDirection).toBe('asc');
    });

    it('should toggle direction to desc when same column is sorted twice', () => {
      component.sort('bookCopyCount');
      component.sort('bookCopyCount');
      expect(component.sortDirection).toBe('desc');
    });

    it('should reset direction to asc when a different column is sorted', () => {
      component.sort('bookCopyCount');
      component.sort('bookCopyCount'); // now desc
      component.sort('title'); // new column — resets to asc
      expect(component.sortColumn).toBe('title');
      expect(component.sortDirection).toBe('asc');
    });

    it('should sort bookCopyCount ascending — 3 before 8', () => {
      component.rows = [...mockReportData];
      component.sort('bookCopyCount');
      expect(component.rows[0].bookCopyCount).toBe(3);
      expect(component.rows[1].bookCopyCount).toBe(8);
    });

    it('should sort bookCopyCount descending — 8 before 3', () => {
      component.rows = [...mockReportData];
      component.sort('bookCopyCount'); // asc
      component.sort('bookCopyCount'); // desc
      expect(component.rows[0].bookCopyCount).toBe(8);
      expect(component.rows[1].bookCopyCount).toBe(3);
    });

    it('should sort title ascending — Green Eggs and Ham before The Cat in the Hat', () => {
      component.rows = [...mockReportData];
      component.sort('title');
      expect(component.rows[0].title).toBe('Green Eggs and Ham');
      expect(component.rows[1].title).toBe('The Cat in the Hat');
    });

    it('should return correct sort indicators from getSortIndicator()', () => {
      component.sort('bookCopyCount'); // asc
      expect(component.getSortIndicator('bookCopyCount')).toBe(' ▲');
      expect(component.getSortIndicator('title')).toBe('');

      component.sort('bookCopyCount'); // desc
      expect(component.getSortIndicator('bookCopyCount')).toBe(' ▼');
      expect(component.getSortIndicator('title')).toBe('');
    });

    it('should render sortable headers with cursor pointer style after runReport()', () => {
      const domFixture = TestBed.createComponent(BookCopyCountReportComponent);
      const domComponent = domFixture.componentInstance;
      domComponent.rows = [...mockReportData];
      domComponent.hasRun = true;
      domComponent.loading = false;
      domFixture.detectChanges();

      const compiled: HTMLElement = domFixture.nativeElement;
      const ths = Array.from(compiled.querySelectorAll('th'));
      const sortableLabels = ['Title', 'Author', 'Publisher', 'Reading Level', 'ISBN', 'Box Number', 'Copy Count'];

      sortableLabels.forEach(label => {
        const th = ths.find(el => el.textContent?.trim().startsWith(label));
        expect(th).withContext(`<th> for "${label}" should exist`).toBeTruthy();
        if (th) {
          expect((th as HTMLElement).style.cursor)
            .withContext(`<th> for "${label}" should have cursor: pointer`)
            .toBe('pointer');
        }
      });
    });
  });
});
