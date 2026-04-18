import { ChangeDetectorRef, Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BaggyBookService } from '../../services/baggy-book.service';
import { StudentYearEndReportItem } from '../../entities/student-year-end-report-item';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css'],
  standalone: false
})
export class AdminReportsComponent {
  rows: StudentYearEndReportItem[] = [];
  loading = false;
  exporting = false;
  hasRun = false;

  constructor(private baggyBookService: BaggyBookService, private cd: ChangeDetectorRef) { }

  runReport(): void {
    this.loading = true;
    this.baggyBookService.getEndOfYearStudentReport().subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
        this.hasRun = true;
      },
      error: () => {
        this.loading = false;
        this.hasRun = true;
      }
    });
  }

  exportCSV(): void {
    this.exporting = true;
    this.baggyBookService.exportEndOfYearStudentReport()
      .pipe(finalize(() => { this.exporting = false; this.cd.detectChanges(); }))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'end-of-year-student-report.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
  }
}