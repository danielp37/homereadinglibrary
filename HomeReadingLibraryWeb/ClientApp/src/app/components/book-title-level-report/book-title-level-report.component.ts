import { ChangeDetectorRef, Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BaggyBookService } from '../../services/baggy-book.service';
import { BookTitleLevelReportItem } from '../../entities/book-title-level-report-item';

@Component({
  selector: 'app-book-title-level-report',
  templateUrl: './book-title-level-report.component.html',
  styleUrls: ['./book-title-level-report.component.css'],
  standalone: false
})
export class BookTitleLevelReportComponent {
  rows: BookTitleLevelReportItem[] = [];
  loading = false;
  exporting = false;
  hasRun = false;

  constructor(private baggyBookService: BaggyBookService, private cd: ChangeDetectorRef) { }

  runReport(): void {
    this.loading = true;
    this.baggyBookService.getBookTitlesPerLevelReport().subscribe({
      next: data => {
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
    this.baggyBookService.exportBookTitlesPerLevelReport()
      .pipe(finalize(() => { this.exporting = false; this.cd.detectChanges(); }))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'book-titles-per-level-report.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
  }
}
