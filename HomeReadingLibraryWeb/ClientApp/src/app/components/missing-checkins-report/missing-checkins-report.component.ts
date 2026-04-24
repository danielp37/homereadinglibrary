import { Component } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { MissingCheckinReportItem } from '../../entities/missing-checkin-report-item';

type SortColumn = 'teacherName' | 'studentLastName' | 'bookTitle' | 'readingLevel' | 'checkedOutDate';

@Component({
  selector: 'app-missing-checkins-report',
  templateUrl: './missing-checkins-report.component.html',
  styleUrls: ['./missing-checkins-report.component.css'],
  standalone: false
})

export class MissingCheckinsReportComponent {
  rows: MissingCheckinReportItem[] = [];
  loading = false;
  hasRun = false;
  sortColumn: SortColumn | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private baggyBookService: BaggyBookService) { }

  runReport(): void {
    this.loading = true;
    this.baggyBookService.getMissingCheckinsReport().subscribe({
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
        case 'teacherName':
          return dir * a.teacherName.toLowerCase().localeCompare(b.teacherName.toLowerCase());
        case 'studentLastName':
          return dir * a.studentLastName.toLowerCase().localeCompare(b.studentLastName.toLowerCase());
        case 'bookTitle':
          return dir * a.bookTitle.toLowerCase().localeCompare(b.bookTitle.toLowerCase());
        case 'readingLevel': {
          const lvlCmp = a.readingLevel.toLowerCase().localeCompare(b.readingLevel.toLowerCase());
          if (lvlCmp !== 0) return dir * lvlCmp;
          const aBox = parseInt(a.boxNumber, 10) || 0;
          const bBox = parseInt(b.boxNumber, 10) || 0;
          return dir * (aBox - bBox);
        }
        case 'checkedOutDate':
          return dir * a.checkedOutDate.localeCompare(b.checkedOutDate);
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
