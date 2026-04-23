import { Component } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { MissingCheckinReportItem } from '../../entities/missing-checkin-report-item';

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

  constructor(private baggyBookService: BaggyBookService) { }

  runReport(): void {
    this.loading = true;
    this.baggyBookService.getMissingCheckinsReport().subscribe({
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
}
