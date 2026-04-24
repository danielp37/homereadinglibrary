import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MissingCheckinsReportComponent } from './missing-checkins-report.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { of, throwError } from 'rxjs';
import { MissingCheckinReportItem } from '../../entities/missing-checkin-report-item';

describe('MissingCheckinsReportComponent', () => {
  let component: MissingCheckinsReportComponent;
  let fixture: ComponentFixture<MissingCheckinsReportComponent>;
  let mockBaggyBookService: jasmine.SpyObj<BaggyBookService>;

  const mockReportData: MissingCheckinReportItem[] = [
    {
      studentFirstName: 'John',
      studentLastName: 'Doe',
      studentBarCode: 'STU001',
      teacherName: 'Ms. Smith',
      grade: '3',
      bookTitle: 'The Cat in the Hat',
      bookCopyBarCode: 'BC001',
      readingLevel: 'B',
      boxNumber: '12',
      checkedOutDate: '2024-01-15T00:00:00Z'
    },
    {
      studentFirstName: 'Sara',
      studentLastName: 'Williams',
      studentBarCode: 'STU002',
      teacherName: 'Mr. Jones',
      grade: '4',
      bookTitle: 'Green Eggs and Ham',
      bookCopyBarCode: 'BC002',
      readingLevel: 'C',
      boxNumber: '7',
      checkedOutDate: '2024-02-20T00:00:00Z'
    }
  ];

  beforeEach(waitForAsync(() => {
    mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', [
      'getMissingCheckinsReport'
    ]);
    mockBaggyBookService.getMissingCheckinsReport.and.returnValue(of(mockReportData));

    TestBed.configureTestingModule({
      declarations: [ MissingCheckinsReportComponent ],
      providers: [ { provide: BaggyBookService, useValue: mockBaggyBookService } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissingCheckinsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not load data on init — report requires user to click Run Report', () => {
    expect(mockBaggyBookService.getMissingCheckinsReport).not.toHaveBeenCalled();
    expect(component.rows).toEqual([]);
    expect(component.hasRun).toBeFalse();
  });

  it('should load data and set hasRun when runReport is called', (done) => {
    component.runReport();

    setTimeout(() => {
      expect(mockBaggyBookService.getMissingCheckinsReport).toHaveBeenCalled();
      expect(component.rows).toEqual(mockReportData);
      expect(component.loading).toBe(false);
      expect(component.hasRun).toBeTrue();
      done();
    }, 10);
  });

  it('should set hasRun and loading to false on error', (done) => {
    mockBaggyBookService.getMissingCheckinsReport.and.returnValue(
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

  it('should render Teacher, Grade, and Student Barcode column headers when data is present', (done) => {
    component.runReport();

    setTimeout(() => {
      fixture.detectChanges();
      const compiled: HTMLElement = fixture.nativeElement;
      const headers = Array.from(compiled.querySelectorAll('th')).map(th => th.textContent?.trim());
      expect(headers).toContain('Teacher');
      expect(headers).toContain('Grade');
      expect(headers).toContain('Student Barcode');
      done();
    }, 10);
  });

  describe('sorting', () => {
    const extraItem: MissingCheckinReportItem = {
      studentFirstName: 'Alice',
      studentLastName: 'Brown',
      studentBarCode: 'STU003',
      teacherName: 'Ms. Smith',
      grade: '3',
      bookTitle: 'Fox in Socks',
      bookCopyBarCode: 'BC003',
      readingLevel: 'B',
      boxNumber: '5',
      checkedOutDate: '2024-03-10T00:00:00Z'
    };

    it('should have sortColumn as empty string and sortDirection as asc initially', () => {
      expect(component.sortColumn).toBe('');
      expect(component.sortDirection).toBe('asc');
    });

    it('should set sortColumn when sort() is called', () => {
      component.sort('teacherName');
      expect(component.sortColumn).toBe('teacherName');
    });

    it('should default to asc direction on first sort of a column', () => {
      component.sort('teacherName');
      expect(component.sortDirection).toBe('asc');
    });

    it('should toggle direction to desc when same column is sorted twice', () => {
      component.sort('teacherName');
      component.sort('teacherName');
      expect(component.sortDirection).toBe('desc');
    });

    it('should reset direction to asc when a different column is sorted', () => {
      component.sort('teacherName');
      component.sort('teacherName'); // now desc
      component.sort('studentLastName'); // new column — resets to asc
      expect(component.sortColumn).toBe('studentLastName');
      expect(component.sortDirection).toBe('asc');
    });

    it('should sort teacherName ascending — Mr. Jones before Ms. Smith', () => {
      component.rows = [...mockReportData];
      component.sort('teacherName');
      expect(component.rows[0].teacherName).toBe('Mr. Jones');
      expect(component.rows[1].teacherName).toBe('Ms. Smith');
    });

    it('should sort teacherName descending — Ms. Smith before Mr. Jones', () => {
      component.rows = [...mockReportData];
      component.sort('teacherName'); // asc
      component.sort('teacherName'); // desc
      expect(component.rows[0].teacherName).toBe('Ms. Smith');
      expect(component.rows[1].teacherName).toBe('Mr. Jones');
    });

    it('should sort studentLastName ascending — Doe before Williams', () => {
      component.rows = [...mockReportData];
      component.sort('studentLastName');
      expect(component.rows[0].studentLastName).toBe('Doe');
      expect(component.rows[1].studentLastName).toBe('Williams');
    });

    it('should sort bookTitle ascending — Green Eggs and Ham before The Cat in the Hat', () => {
      component.rows = [...mockReportData];
      component.sort('bookTitle');
      expect(component.rows[0].bookTitle).toBe('Green Eggs and Ham');
      expect(component.rows[1].bookTitle).toBe('The Cat in the Hat');
    });

    it('should sort checkedOutDate ascending — January date before February date', () => {
      component.rows = [...mockReportData];
      component.sort('checkedOutDate');
      expect(component.rows[0].checkedOutDate).toBe('2024-01-15T00:00:00Z');
      expect(component.rows[1].checkedOutDate).toBe('2024-02-20T00:00:00Z');
    });

    it('should sort readingLevel ascending with secondary sort by boxNumber numerically', () => {
      component.rows = [mockReportData[0], extraItem, mockReportData[1]];
      component.sort('readingLevel');
      // Level 'B' rows first (box 5 before box 12), then level 'C'
      expect(component.rows[0].readingLevel).toBe('B');
      expect(component.rows[0].boxNumber).toBe('5');
      expect(component.rows[1].readingLevel).toBe('B');
      expect(component.rows[1].boxNumber).toBe('12');
      expect(component.rows[2].readingLevel).toBe('C');
    });

    it('should return correct sort indicators from getSortIndicator()', () => {
      component.sort('teacherName'); // asc
      expect(component.getSortIndicator('teacherName')).toBe(' ▲');
      expect(component.getSortIndicator('bookTitle')).toBe('');

      component.sort('teacherName'); // desc
      expect(component.getSortIndicator('teacherName')).toBe(' ▼');
      expect(component.getSortIndicator('bookTitle')).toBe('');
    });

    it('should render sortable headers with cursor pointer style after runReport()', (done) => {
      component.runReport();

      setTimeout(() => {
        fixture.detectChanges();
        const compiled: HTMLElement = fixture.nativeElement;
        const ths = Array.from(compiled.querySelectorAll('th'));
        const sortableLabels = ['Teacher', 'Last Name', 'Book Title', 'Reading Level', 'Checked Out'];

        sortableLabels.forEach(label => {
          const th = ths.find(el => el.textContent?.trim().startsWith(label));
          expect(th).withContext(`<th> for "${label}" should exist`).toBeTruthy();
          if (th) {
            expect(th.style.cursor)
              .withContext(`<th> for "${label}" should have cursor: pointer`)
              .toBe('pointer');
          }
        });
        done();
      }, 10);
    });
  });
});
