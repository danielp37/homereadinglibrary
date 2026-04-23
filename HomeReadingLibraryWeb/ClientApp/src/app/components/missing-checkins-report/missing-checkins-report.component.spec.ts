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
});
