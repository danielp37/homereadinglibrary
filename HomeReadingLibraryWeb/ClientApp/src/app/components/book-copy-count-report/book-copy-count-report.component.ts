import { ChangeDetectorRef, Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BaggyBookService } from '../../services/baggy-book.service';
import { BookCopyCountReportItem } from '../../entities/book-copy-count-report-item';

type SortColumn = 'title' | 'author' | 'publisherText' | 'guidedReadingLevel' | 'isbn' | 'boxNumber' | 'bookCopyCount';

@Component({
  selector: 'app-book-copy-count-report',
  templateUrl: './book-copy-count-report.component.html',
  styleUrls: ['./book-copy-count-report.component.css'],
  standalone: false
})

export class BookCopyCountReportComponent {
  rows: BookCopyCountReportItem[] = [];
  loading = false;
  exporting = false;
  hasRun = false;
  sortColumn: SortColumn | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private baggyBookService: BaggyBookService, private cd: ChangeDetectorRef) { }

  runReport(): void {
    this.loading = true;
    this.baggyBookService.getBookCopyCountsReport().subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
        this.hasRun = true;
        this.sortColumn = '';
        this.sortDirection = 'asc';
      },
      error: () => {
        this.loading = false;
        this.hasRun = true;
      }
    });
  }

  exportCSV(): void {
    this.exporting = true;
    this.baggyBookService.exportBookCopyCountsReport()
      .pipe(finalize(() => { this.exporting = false; this.cd.detectChanges(); }))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'book-copy-counts-report.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
  }

  sort(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    const dir = this.sortDirection === 'asc' ? 1 : -1;

    this.rows.sort((a, b) => {
      switch (column) {
        case 'bookCopyCount':
          return dir * (a.bookCopyCount - b.bookCopyCount);
        case 'title':
          return dir * (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase());
        case 'author':
          return dir * (a.author || '').toLowerCase().localeCompare((b.author || '').toLowerCase());
        case 'publisherText':
          return dir * (a.publisherText || '').toLowerCase().localeCompare((b.publisherText || '').toLowerCase());
        case 'guidedReadingLevel':
          return dir * (a.guidedReadingLevel || '').toLowerCase().localeCompare((b.guidedReadingLevel || '').toLowerCase());
        case 'isbn':
          return dir * (a.isbn || '').toLowerCase().localeCompare((b.isbn || '').toLowerCase());
        case 'boxNumber':
          return dir * (a.boxNumber || '').toLowerCase().localeCompare((b.boxNumber || '').toLowerCase());
        default:
          return 0;
      }
    });
  }

  getSortIndicator(column: SortColumn): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? ' ▲' : ' ▼';
  }
}
