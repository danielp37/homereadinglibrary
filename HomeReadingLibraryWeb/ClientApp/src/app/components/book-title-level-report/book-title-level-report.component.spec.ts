import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { BookTitleLevelReportComponent } from './book-title-level-report.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { BookTitleLevelReportItem } from '../../entities/book-title-level-report-item';

describe('BookTitleLevelReportComponent', () => {
  let component: BookTitleLevelReportComponent;
  let fixture: ComponentFixture<BookTitleLevelReportComponent>;
  let service: jasmine.SpyObj<BaggyBookService>;

  const rows: BookTitleLevelReportItem[] = [
    { guidedReadingLevel: 'A', boxNumber: '1', bookTitleCount: 2, bookCopyCount: 5 }
  ];

  beforeEach(waitForAsync(() => {
    service = jasmine.createSpyObj('BaggyBookService', [
      'getBookTitlesPerLevelReport', 'exportBookTitlesPerLevelReport'
    ]);
    service.getBookTitlesPerLevelReport.and.returnValue(of(rows));
    service.exportBookTitlesPerLevelReport.and.returnValue(of(new Blob(['test'], { type: 'text/csv' })));
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL');

    TestBed.configureTestingModule({
      declarations: [BookTitleLevelReportComponent],
      imports: [CommonModule],
      providers: [{ provide: BaggyBookService, useValue: service }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookTitleLevelReportComponent);
    component = fixture.componentInstance;
  });

  it('should load grouped data when runReport is called', () => {
    component.runReport();
    expect(service.getBookTitlesPerLevelReport).toHaveBeenCalled();
    expect(component.rows).toEqual(rows);
    expect(component.hasRun).toBeTrue();
  });

  it('should finish the report when loading fails', () => {
    service.getBookTitlesPerLevelReport.and.returnValue(throwError(() => new Error('Failed')));
    component.runReport();
    expect(component.loading).toBeFalse();
    expect(component.hasRun).toBeTrue();
  });

  it('should render grouped count headers', () => {
    component.rows = rows;
    component.hasRun = true;
    fixture.detectChanges();
    const headers = Array.from(fixture.nativeElement.querySelectorAll('th'))
      .map((header: HTMLElement) => header.textContent?.trim());
    expect(headers).toEqual(['Reading Level', 'Box Number', 'Book Title Count', 'Book Copy Count']);
  });
});
