import { Component } from '@angular/core';
import { BaggyBookService, UploadResult } from '../../services/baggy-book.service';

@Component({
  selector: 'app-volunteer-upload',
  templateUrl: './volunteer-upload.component.html',
  styleUrls: ['./volunteer-upload.component.css'],
  standalone: false
})
export class VolunteerUploadComponent {
  selectedFile: File | null = null;
  uploadResult: UploadResult | null = null;
  errorMessage: string | null = null;
  uploading = false;
  downloadingTemplate = false;

  constructor(private baggyBookService: BaggyBookService) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length > 0
      ? input.files[0]
      : null;
  }

  upload(): void {
    if (!this.selectedFile || this.uploading) {
      return;
    }

    this.uploading = true;
    this.uploadResult = null;
    this.errorMessage = null;

    this.baggyBookService.uploadVolunteerSpreadsheet(this.selectedFile).subscribe({
      next: result => {
        this.uploadResult = result;
        this.uploading = false;
      },
      error: (err: Error) => {
        this.errorMessage = this.formatError(err);
        this.uploading = false;
      }
    });
  }

  downloadTemplate(): void {
    if (this.downloadingTemplate) {
      return;
    }

    this.downloadingTemplate = true;
    this.errorMessage = null;

    this.baggyBookService.downloadVolunteerUploadTemplate().subscribe({
      next: blob => {
        this.saveFile(blob, 'volunteers-template.xlsx');
        this.downloadingTemplate = false;
      },
      error: (err: Error) => {
        this.errorMessage = this.formatError(err);
        this.downloadingTemplate = false;
      }
    });
  }

  private saveFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  private formatError(err: Error): string {
    return err?.message || 'An unexpected error occurred.';
  }
}
