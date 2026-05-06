import { ChangeDetectorRef, Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BaggyBookService } from '../../services/baggy-book.service';
import { YearEndCheckinReportItem } from '../../entities/year-end-checkin-report-item';

@Component({
  selector: 'app-year-end-checkins-report',
  templateUrl: './year-end-checkins-report.component.html',
  styleUrls: ['./year-end-checkins-report.component.css'],
  standalone: false
})
export class YearEndCheckinsReportComponent {
  rows: YearEndCheckinReportItem[] = [];
  loading = false;
  exporting = false;
  hasRun = false;

  constructor(private baggyBookService: BaggyBookService, private cd: ChangeDetectorRef) { }

  runReport(): void {
    this.loading = true;
    this.baggyBookService.getYearEndCheckinsReport().subscribe({
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
    this.baggyBookService.exportYearEndCheckinsReport()
      .pipe(finalize(() => { this.exporting = false; this.cd.detectChanges(); }))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'year-end-checkins-report.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
  }
}
