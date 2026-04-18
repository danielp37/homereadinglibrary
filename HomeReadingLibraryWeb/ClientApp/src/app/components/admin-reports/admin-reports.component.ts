import { Component, OnInit } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { StudentYearEndReportItem } from '../../entities/student-year-end-report-item';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css'],
  standalone: false
})
export class AdminReportsComponent implements OnInit {
  rows: StudentYearEndReportItem[] = [];
  loading = false;

  constructor(private baggyBookService: BaggyBookService) { }

  ngOnInit(): void {
    this.loading = true;
    this.baggyBookService.getEndOfYearStudentReport().subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  exportCSV() {
    this.baggyBookService.exportEndOfYearStudentReport();
  }
}
