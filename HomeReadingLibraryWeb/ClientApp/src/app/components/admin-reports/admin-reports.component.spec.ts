import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AdminReportsComponent } from './admin-reports.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { of, throwError } from 'rxjs';
import { StudentYearEndReportItem } from '../../entities/student-year-end-report-item';

describe('AdminReportsComponent', () => {
  let component: AdminReportsComponent;
  let fixture: ComponentFixture<AdminReportsComponent>;
  let mockBaggyBookService: jasmine.SpyObj<BaggyBookService>;

  const mockReportData: StudentYearEndReportItem[] = [
    {
      teacherName: 'Smith, Jane',
      grade: '3',
      lastName: 'Doe',
      firstName: 'John',
      startingReadingLevel: 'B',
      endingReadingLevel: 'D'
    },
    {
      teacherName: 'Johnson, Bob',
      grade: '4',
      lastName: 'Williams',
      firstName: 'Sara',
      startingReadingLevel: 'C',
      endingReadingLevel: 'F'
    }
  ];

  beforeEach(waitForAsync(() => {
    mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', [
      'getEndOfYearStudentReport',
      'exportEndOfYearStudentReport'
    ]);
    mockBaggyBookService.getEndOfYearStudentReport.and.returnValue(of(mockReportData));
    mockBaggyBookService.exportEndOfYearStudentReport.and.returnValue(of(new Blob(['test'], { type: 'text/csv' })));

    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL');

    TestBed.configureTestingModule({
      declarations: [ AdminReportsComponent ],
      providers: [ { provide: BaggyBookService, useValue: mockBaggyBookService } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not load data on init — report requires user to click Run Report', () => {
    expect(mockBaggyBookService.getEndOfYearStudentReport).not.toHaveBeenCalled();
    expect(component.rows).toEqual([]);
    expect(component.hasRun).toBeFalse();
  });

  it('should load data and set hasRun when runReport is called', (done) => {
    component.runReport();

    setTimeout(() => {
      expect(mockBaggyBookService.getEndOfYearStudentReport).toHaveBeenCalled();
      expect(component.rows).toEqual(mockReportData);
      expect(component.loading).toBe(false);
      expect(component.hasRun).toBeTrue();
      done();
    }, 10);
  });

  it('should set hasRun and loading to false on error', (done) => {
    mockBaggyBookService.getEndOfYearStudentReport.and.returnValue(
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

  it('should call exportEndOfYearStudentReport and trigger download when exportCSV is called', (done) => {
    component.exportCSV();
    expect(component.exporting).toBeTrue();

    setTimeout(() => {
      expect(mockBaggyBookService.exportEndOfYearStudentReport).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
      expect(component.exporting).toBeFalse();
      done();
    }, 10);
  });
});
