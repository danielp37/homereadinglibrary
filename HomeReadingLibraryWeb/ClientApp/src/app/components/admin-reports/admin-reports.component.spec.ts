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

    TestBed.configureTestingModule({
      declarations: [ AdminReportsComponent ],
      providers: [ { provide: BaggyBookService, useValue: mockBaggyBookService } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminReportsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getEndOfYearStudentReport on init and populate rows', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(mockBaggyBookService.getEndOfYearStudentReport).toHaveBeenCalled();
      expect(component.rows).toEqual(mockReportData);
      expect(component.loading).toBe(false);
      done();
    }, 10);
  });

  it('should set loading to false on error', (done) => {
    mockBaggyBookService.getEndOfYearStudentReport.and.returnValue(
      throwError(() => new Error('Failed to load'))
    );

    fixture.detectChanges();

    setTimeout(() => {
      expect(mockBaggyBookService.getEndOfYearStudentReport).toHaveBeenCalled();
      expect(component.rows).toEqual([]);
      expect(component.loading).toBe(false);
      done();
    }, 10);
  });

  it('should call exportEndOfYearStudentReport when exportCSV is called', () => {
    component.exportCSV();
    expect(mockBaggyBookService.exportEndOfYearStudentReport).toHaveBeenCalled();
  });
});
