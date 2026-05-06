import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { YearEndCheckinsReportComponent } from './year-end-checkins-report.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { of, throwError } from 'rxjs';
import { YearEndCheckinReportItem } from '../../entities/year-end-checkin-report-item';

describe('YearEndCheckinsReportComponent', () => {
  let component: YearEndCheckinsReportComponent;
  let fixture: ComponentFixture<YearEndCheckinsReportComponent>;
  let mockBaggyBookService: jasmine.SpyObj<BaggyBookService>;

  const mockReportData: YearEndCheckinReportItem[] = [
    {
      teacherName: 'Smith, Jane',
      grade: '3',
      lastName: 'Doe',
      firstName: 'John',
      lastCheckedInDate: '2025-05-01T00:00:00Z'
    },
    {
      teacherName: 'Johnson, Bob',
      grade: '4',
      lastName: 'Williams',
      firstName: 'Sara',
      lastCheckedInDate: '2025-04-28T00:00:00Z'
    }
  ];

  beforeEach(waitForAsync(() => {
    mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', [
      'getYearEndCheckinsReport',
      'exportYearEndCheckinsReport'
    ]);
    mockBaggyBookService.getYearEndCheckinsReport.and.returnValue(of(mockReportData));
    mockBaggyBookService.exportYearEndCheckinsReport.and.returnValue(of(new Blob(['test'], { type: 'text/csv' })));

    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL');

    TestBed.configureTestingModule({
      declarations: [ YearEndCheckinsReportComponent ],
      providers: [ { provide: BaggyBookService, useValue: mockBaggyBookService } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YearEndCheckinsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not load data on init — report requires user to click Run Report', () => {
    expect(mockBaggyBookService.getYearEndCheckinsReport).not.toHaveBeenCalled();
    expect(component.rows).toEqual([]);
    expect(component.hasRun).toBeFalse();
  });

  it('should load data and set hasRun when runReport is called', (done) => {
    component.runReport();

    setTimeout(() => {
      expect(mockBaggyBookService.getYearEndCheckinsReport).toHaveBeenCalled();
      expect(component.rows).toEqual(mockReportData);
      expect(component.loading).toBe(false);
      expect(component.hasRun).toBeTrue();
      done();
    }, 10);
  });

  it('should set hasRun and loading to false on error', (done) => {
    mockBaggyBookService.getYearEndCheckinsReport.and.returnValue(
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

  it('should call exportYearEndCheckinsReport and trigger download when exportCSV is called', (done) => {
    component.exportCSV();
    expect(component.exporting).toBeTrue();

    setTimeout(() => {
      expect(mockBaggyBookService.exportYearEndCheckinsReport).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
      expect(component.exporting).toBeFalse();
      done();
    }, 10);
  });
});
