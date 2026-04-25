import { BookSearchParameters } from './../../services/Book-Search-Parameters';
import { DataTableParams } from './../../models/data-table-params';
import { BookCopyReservationWithData } from './../../entities/book-copy-reservation-with-data';
import { BaggyBookService } from './../../services/baggy-book.service';
import { LateNoticeTemplateService } from './../../services/late-notice-template.service';
import { ChangeDetectorRef, Component, NgZone, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';

interface StudentNotice {
  html: string;
}

@Component({
    standalone: false,
  selector: 'app-book-copy-reservations',
  templateUrl: './book-copy-reservations.component.html',
  styleUrls: ['./book-copy-reservations.component.css']
})
export class BookCopyReservationsComponent implements OnInit {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  @ViewChild('templateEditorModal') templateEditorModal!: TemplateRef<unknown>;

  totalCount: number;
  bookCopyReservations: BookCopyReservationWithData[];
  lastSearchParams: DataTableParams;
  defaultDaysBack = 21;
  currentDaysBack = this.defaultDaysBack;
  downloadLink: string;
  searchType = 'Title';
  searchText = '';
  showOnlyMultiples = false;
  private isInitialized = false;

  // Applied filter snapshot — updated each time the report loads
  private appliedDaysBack = this.defaultDaysBack;
  private appliedSearchParams: BookSearchParameters = {};

  // Template editor
  templateEditorModalRef?: BsModalRef;
  editableTemplate = '';
  previewHtml = '';

  // Notice generation
  noticePages: StudentNotice[][] = [];
  showNotices = false;
  generatingNotices = false;

  constructor(
    private baggyBookService: BaggyBookService,
    private lateNoticeTemplateService: LateNoticeTemplateService,
    private modalService: BsModalService,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.lastSearchParams = {
      offset: 0,
      limit: 10
    };
    this.bookCopyReservations = [];
    this.totalCount = 0;
  }

  ngOnInit() {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.refreshBookList(this.lastSearchParams);
    }
  }

  getBookCopyReservations() {
    this.appliedDaysBack = this.currentDaysBack;
    this.appliedSearchParams = this.getBookSearchParameters();
    this.baggyBookService.getBookCopyReservations(undefined, this.lastSearchParams, this.currentDaysBack, this.getBookSearchParameters())
      .subscribe(bcr => {
        this.ngZone.run(() => {
          this.totalCount = bcr.count;
          this.bookCopyReservations = [...bcr.reservations];
          this.recalculateTable();
          this.cdr.detectChanges();
        });
      });
  }

  exportToTab() {
    this.baggyBookService.downloadBookCopyReservations(undefined, this.lastSearchParams, this.currentDaysBack
      , this.getBookSearchParameters())
      .subscribe(b => {
        this.downloadLink = b.downloadLink;
        setTimeout(() => this.clickDownloadLink(), 0);
      });
  }

  clickDownloadLink() {
    const downloadReport = this.renderer.selectRootElement('#downloadReport');
    downloadReport.click();
  }

  refreshBookList(params: DataTableParams) {
    this.lastSearchParams = params;
    this.getBookCopyReservations();
  }

  setPage(pageInfo) {
    const nextOffset = pageInfo.offset * this.lastSearchParams.limit;
    if (nextOffset === this.lastSearchParams.offset) {
      return;
    }

    this.lastSearchParams.offset = nextOffset;
    this.refreshBookList(this.lastSearchParams);
  }

  onSort($event) {
    this.lastSearchParams.sortBy = $event.sorts[0].prop;
    this.lastSearchParams.sortAsc = $event.sorts[0].dir === "asc";
    this.refreshBookList(this.lastSearchParams);
  }

  updateBookList(daysBack: number) {
    this.currentDaysBack = daysBack;
    this.refreshBookList({offset: 0, limit: 10});
  }

  getBookSearchParameters(): BookSearchParameters {
    const params: BookSearchParameters = {};
    if (this.searchText) {
      switch (this.searchType) {
        case 'Title':
          params.title = this.searchText;
          break;
        case 'Author':
          params.author = this.searchText;
          break;
        case 'ReadingLevel/Box':
          params.boxNumber = this.searchText;
          break;
        case 'Book BarCode':
          params.bookBarCode = this.searchText;
          break;
        case 'Teacher':
          params.teacherName = this.searchText;
          break;
        case 'Student Name':
          params.studentName = this.searchText;
          break;
        case 'Grade':
          params.grade = this.searchText;
          break;
      }
    }
    if (this.showOnlyMultiples) {
      params.showMultiples = true;
    }
    return params;
  }

  private recalculateTable() {
    // ngx-datatable can miss initial async row updates unless layout is recalculated.
    setTimeout(() => this.table?.recalculate(), 0);
  }

  // ─── Template Editor ─────────────────────────────────────────────────────────

  openTemplateEditor(): void {
    this.editableTemplate = this.lateNoticeTemplateService.getTemplate();
    this.updatePreview();
    this.templateEditorModalRef = this.modalService.show(this.templateEditorModal, { class: 'modal-lg modal-dialog-scrollable' });
  }

  closeTemplateEditor(): void {
    this.templateEditorModalRef?.hide();
  }

  saveTemplate(): void {
    this.lateNoticeTemplateService.setTemplate(this.editableTemplate);
    this.closeTemplateEditor();
  }

  resetTemplate(): void {
    this.editableTemplate = this.lateNoticeTemplateService.DEFAULT_TEMPLATE;
    this.updatePreview();
  }

  updatePreview(): void {
    const sampleData = {
      studentName: 'John Smith',
      grade: '3',
      teacherName: 'Ms. Johnson',
      books: [
        { title: 'The Cat in the Hat', checkedOutDate: '01/01/2025' },
        { title: 'Green Eggs and Ham', checkedOutDate: '01/05/2025' },
      ],
    };
    this.previewHtml = this.lateNoticeTemplateService.renderNoticeFromTemplate(this.editableTemplate, sampleData);
  }

  // ─── Notice Generation ───────────────────────────────────────────────────────

  generateNotices(): void {
    this.generatingNotices = true;
    this.baggyBookService.getAllBookCopyReservationsForNotices(
      this.appliedDaysBack, this.appliedSearchParams
    ).subscribe({
      next: (reservations) => {
        this.ngZone.run(() => {
          this.buildNotices(reservations);
          this.generatingNotices = false;
          this.showNotices = true;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.generatingNotices = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  printNotices(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      requestAnimationFrame(() => window.print());
    });
  }

  closeNotices(): void {
    this.showNotices = false;
    this.noticePages = [];
  }

  private buildNotices(reservations: BookCopyReservationWithData[]): void {
    const byStudent = new Map<string, BookCopyReservationWithData[]>();
    for (const r of reservations) {
      const key = r.student.studentBarCode;
      if (!byStudent.has(key)) byStudent.set(key, []);
      byStudent.get(key)!.push(r);
    }

    const notices: StudentNotice[] = Array.from(byStudent.values())
      .sort((a, b) => {
        const s1 = a[0].student, s2 = b[0].student;
        const teacherCmp = s1.teacherName.localeCompare(s2.teacherName);
        if (teacherCmp !== 0) return teacherCmp;
        const lastCmp = s1.lastName.localeCompare(s2.lastName);
        if (lastCmp !== 0) return lastCmp;
        return s1.firstName.localeCompare(s2.firstName);
      })
      .map(group => {
        const s = group[0].student;
        const books = group.map(r => ({
          title: r.bookCopy.title,
          checkedOutDate: this.formatCheckedOutDate(String(r.checkedOutDate)),
        }));
        return {
          html: this.lateNoticeTemplateService.renderNotice({
            studentName: `${s.firstName} ${s.lastName}`,
            grade: String(s.grade),
            teacherName: s.teacherName,
            books,
          }),
        };
      });

    this.noticePages = this.chunkArray(notices, 2);
  }

  private formatCheckedOutDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return utcDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
}
