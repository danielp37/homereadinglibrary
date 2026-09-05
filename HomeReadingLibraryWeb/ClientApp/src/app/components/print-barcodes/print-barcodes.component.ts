import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { BaggyBookService } from '../../services/baggy-book.service';
import { Class } from '../../entities/class';
import { StudentForBarcode } from '../../entities/student-for-barcode';

export const LABELS_PER_SHEET = 20; // Avery 5161: 2 columns x 10 rows

interface LabelSlot {
  blank: boolean;
  teacherName?: string;
  studentName?: string;
  barCode?: string;
}

@Component({
  standalone: false,
  selector: 'app-print-barcodes',
  templateUrl: './print-barcodes.component.html',
  styleUrls: ['./print-barcodes.component.css']
})
export class PrintBarcodesComponent implements OnInit {
  classes: Class[] = [];
  allStudents: StudentForBarcode[] = [];
  filteredStudents: StudentForBarcode[] = [];

  selectedClassId = '';
  searchText = '';

  selectedKeys = new Set<string>();

  // 1-based position on the Avery 5161 sheet (1-20) where printing should start.
  startPosition = 1;
  readonly labelSlotIndexes = Array.from({ length: LABELS_PER_SHEET }, (_, i) => i + 1);

  labelPages: LabelSlot[][] = [];
  showPrintOverlay = false;

  constructor(
    private baggyBookService: BaggyBookService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.baggyBookService.getClasses().subscribe(classes => {
      this.ngZone.run(() => {
        this.classes = [...classes];
        this.allStudents = this.flattenStudents(this.classes);
        this.applyFilter();
        this.cdr.detectChanges();
      });
    });
  }

  flattenStudents(classes: Class[]): StudentForBarcode[] {
    const flattened: StudentForBarcode[] = (classes || []).flatMap(cls =>
      (cls.students || []).map((student, index) => ({
        // classId + index guarantees uniqueness even if barCode is duplicated across records.
        key: `${cls.classId}::${index}`,
        classId: cls.classId,
        teacherName: cls.teacherName,
        grade: cls.grade,
        firstName: student.firstName,
        lastName: student.lastName,
        barCode: student.barCode
      }))
    );

    return flattened.sort((a, b) =>
      a.teacherName.localeCompare(b.teacherName) ||
      a.lastName.localeCompare(b.lastName) ||
      a.firstName.localeCompare(b.firstName)
    );
  }

  applyFilter(): void {
    const search = this.searchText.trim().toLowerCase();
    this.filteredStudents = this.allStudents.filter(s => {
      const matchesClass = !this.selectedClassId || s.classId === this.selectedClassId;
      if (!matchesClass) {
        return false;
      }
      if (!search) {
        return true;
      }
      const haystack = `${s.firstName} ${s.lastName} ${s.barCode}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  isSelected(key: string): boolean {
    return this.selectedKeys.has(key);
  }

  toggleStudent(key: string, checked: boolean): void {
    if (checked) {
      this.selectedKeys.add(key);
    } else {
      this.selectedKeys.delete(key);
    }
  }

  selectAllFiltered(): void {
    this.filteredStudents.forEach(s => this.selectedKeys.add(s.key));
  }

  clearSelection(): void {
    this.selectedKeys.clear();
  }

  get selectedCount(): number {
    return this.selectedKeys.size;
  }

  setStartPosition(position: number): void {
    this.startPosition = position;
  }

  get selectedStudents(): StudentForBarcode[] {
    return this.allStudents.filter(s => this.selectedKeys.has(s.key));
  }

  generateLabels(students: StudentForBarcode[]): void {
    const blanks: LabelSlot[] = Array.from({ length: this.startPosition - 1 }, () => ({ blank: true }));
    const labels: LabelSlot[] = students.map(s => ({
      blank: false,
      teacherName: s.teacherName,
      studentName: `${s.firstName} ${s.lastName}`,
      barCode: s.barCode
    }));

    this.labelPages = this.chunkArray([...blanks, ...labels], LABELS_PER_SHEET);
    this.showPrintOverlay = true;
  }

  printAll(): void {
    this.generateLabels(this.allStudents);
  }

  printSelected(): void {
    this.generateLabels(this.selectedStudents);
  }

  printLabels(): void {
    this.ngZone.runOutsideAngular(() => setTimeout(() => window.print(), 0));
  }

  closePrintOverlay(): void {
    this.showPrintOverlay = false;
    this.labelPages = [];
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
}
