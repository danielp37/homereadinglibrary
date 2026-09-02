import { Component, OnInit } from '@angular/core';
import { BaggyBookService, DatabaseRefreshAuditRecord } from '../../services/baggy-book.service';

@Component({
  selector: 'app-database-refresh',
  templateUrl: './database-refresh.component.html',
  styleUrls: ['./database-refresh.component.css'],
  standalone: false
})
export class DatabaseRefreshComponent implements OnInit {
  confirmationText = '';
  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  refreshHistory: DatabaseRefreshAuditRecord[] = [];
  historyLoading = false;

  readonly today: string;

  constructor(private baggyBookService: BaggyBookService) {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    this.today = `${mm}/${dd}/${yyyy}`;
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  get confirmationMatches(): boolean {
    return this.confirmationText.trim() === this.today;
  }

  executeRefresh(): void {
    if (!this.confirmationMatches || this.loading) {
      return;
    }

    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.baggyBookService.refreshDatabase(this.confirmationText.trim()).subscribe({
      next: (result) => {
        this.loading = false;
        this.successMessage = `Database refreshed successfully. A backup was created (${result.backupSuffix}).`;
        this.confirmationText = '';
        this.loadHistory();
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = `Refresh failed: ${err.message || 'An unexpected error occurred.'}`;
      }
    });
  }

  private loadHistory(): void {
    this.historyLoading = true;
    this.baggyBookService.getRefreshHistory().subscribe({
      next: (history) => {
        this.refreshHistory = history;
        this.historyLoading = false;
      },
      error: () => {
        this.historyLoading = false;
      }
    });
  }
}
