import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { PrintBarcodesComponent } from './print-barcodes.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { SortClassPipe } from '../../pipes/sort-class.pipe';
import { BarcodeDirective } from '../../directives/barcode.directive';
import { Class } from '../../entities/class';

describe('PrintBarcodesComponent', () => {
  let component: PrintBarcodesComponent;
  let fixture: ComponentFixture<PrintBarcodesComponent>;

  const classes: Class[] = [
    Class.fromObject({
      classId: 'class-1',
      teacherName: 'Ms. Smith',
      grade: 2,
      students: [
        { firstName: 'Bob', lastName: 'Jones', barCode: 'BC002' },
        { firstName: 'Alice', lastName: 'Adams', barCode: 'BC001' }
      ]
    }),
    Class.fromObject({
      classId: 'class-2',
      teacherName: 'Mr. Lee',
      grade: 3,
      students: [
        { firstName: 'Carl', lastName: 'Cruz', barCode: 'BC003' }
      ]
    })
  ];

  beforeEach(waitForAsync(() => {
    const mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['getClasses']);
    mockBaggyBookService.getClasses.and.returnValue(of(classes));

    TestBed.configureTestingModule({
      declarations: [ PrintBarcodesComponent, SortClassPipe, BarcodeDirective ],
      imports: [ FormsModule ],
      providers: [
        { provide: BaggyBookService, useValue: mockBaggyBookService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintBarcodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('flattens and sorts students by teacher then last then first name', () => {
    // "Mr. Lee" sorts before "Ms. Smith"; within Ms. Smith, Adams sorts before Jones.
    expect(component.allStudents.map(s => s.barCode)).toEqual(['BC003', 'BC001', 'BC002']);
    expect(component.allStudents[0].teacherName).toBe('Mr. Lee');
  });

  it('filters by selected teacher (classId)', () => {
    component.selectedClassId = 'class-2';
    component.applyFilter();
    expect(component.filteredStudents.length).toBe(1);
    expect(component.filteredStudents[0].barCode).toBe('BC003');
  });

  it('filters by search text against name or barcode', () => {
    component.selectedClassId = '';
    component.searchText = 'alice';
    component.applyFilter();
    expect(component.filteredStudents.map(s => s.barCode)).toEqual(['BC001']);

    component.searchText = 'BC003';
    component.applyFilter();
    expect(component.filteredStudents.map(s => s.barCode)).toEqual(['BC003']);
  });

  it('supports selecting/deselecting individual students and selecting all filtered', () => {
    expect(component.selectedCount).toBe(0);

    component.toggleStudent('BC001', true);
    expect(component.isSelected('BC001')).toBeTrue();
    expect(component.selectedCount).toBe(1);

    component.toggleStudent('BC001', false);
    expect(component.selectedCount).toBe(0);

    component.selectAllFiltered();
    expect(component.selectedCount).toBe(3);

    component.clearSelection();
    expect(component.selectedCount).toBe(0);
  });

  it('pads with blank slots up to the chosen start position when generating labels', () => {
    const student = component.allStudents.find(s => s.barCode === 'BC001')!;
    component.setStartPosition(3);
    component.generateLabels([student]);

    expect(component.showPrintOverlay).toBeTrue();
    expect(component.labelPages.length).toBe(1);
    const page = component.labelPages[0];
    expect(page.length).toBe(3);
    expect(page[0].blank).toBeTrue();
    expect(page[1].blank).toBeTrue();
    expect(page[2].blank).toBeFalse();
    expect(page[2].barCode).toBe('BC001');
  });

  it('chunks generated labels into pages of 20', () => {
    const manyStudents = Array.from({ length: 25 }, (_, i) => ({
      classId: 'class-1',
      teacherName: 'Ms. Smith',
      grade: 2,
      firstName: `Student${i}`,
      lastName: 'Test',
      barCode: `BC${i}`
    }));

    component.setStartPosition(1);
    component.generateLabels(manyStudents);

    expect(component.labelPages.length).toBe(2);
    expect(component.labelPages[0].length).toBe(20);
    expect(component.labelPages[1].length).toBe(5);
  });

  it('closePrintOverlay resets state', () => {
    component.setStartPosition(1);
    component.generateLabels(component.allStudents);
    component.closePrintOverlay();

    expect(component.showPrintOverlay).toBeFalse();
    expect(component.labelPages).toEqual([]);
  });
});
