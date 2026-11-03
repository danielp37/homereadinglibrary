import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ClassListsComponent } from './class-lists.component';
import { BaggyBookService } from '../../services/baggy-book.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SortClassPipe } from '../../pipes/sort-class.pipe';
import { AuthService } from '../../modules/app-auth/services/auth.service';
import { Class } from '../../entities/class';

describe('ClassListsComponent', () => {
  let component: ClassListsComponent;
  let fixture: ComponentFixture<ClassListsComponent>;
  let service: jasmine.SpyObj<BaggyBookService>;
  let modalRef: { hide: jasmine.Spy };
  let auth: { isAdmin: boolean };

  const makeClass = (): Class => ({
    classId: 'c1', teacherName: 'Anderson', grade: 1,
    students: [
      { firstName: 'Alice', lastName: 'Adams', barCode: 'S1' },
      { firstName: 'Bob', lastName: 'Baker', barCode: 'S2' }
    ]
  });

  beforeEach(waitForAsync(() => {
    service = jasmine.createSpyObj('BaggyBookService', ['getClasses', 'updateStudent', 'removeStudent', 'updateClass', 'deleteClass']);
    service.getClasses.and.returnValue(of([makeClass()]));
    modalRef = { hide: jasmine.createSpy('hide') };
    auth = { isAdmin: true };

    TestBed.configureTestingModule({
      declarations: [ ClassListsComponent, SortClassPipe ],
      providers: [
        { provide: BaggyBookService, useValue: service },
        { provide: BsModalService, useValue: { show: jasmine.createSpy('show').and.returnValue(modalRef) } },
        { provide: AuthService, useValue: auth }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.selectedClassId = 'c1';
    component.displayClassListForCurrentTeacher();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('exposes admin state from AuthService', () => {
    expect(component.isAdmin).toBeTrue();
    auth.isAdmin = false;
    expect(component.isAdmin).toBeFalse();
  });

  describe('admin button gating (fresh fixture)', () => {
    const render = (isAdmin: boolean) => {
      auth.isAdmin = isAdmin;
      fixture.destroy();
      spyOn(ClassListsComponent.prototype, 'ngOnInit');
      const fresh = TestBed.createComponent(ClassListsComponent);
      const cmp = fresh.componentInstance;
      cmp.classes = [makeClass()];
      cmp.selectedClassId = 'c1';
      cmp.currentClass = makeClass();
      fresh.detectChanges();
      return fresh.nativeElement as HTMLElement;
    };

    it('shows admin action buttons for admins', () => {
      const el = render(true);
      expect(el.querySelector('[data-testid="edit-class-button"]')).not.toBeNull();
      expect(el.querySelector('[data-testid="delete-class-button"]')).not.toBeNull();
    });

    it('hides admin action buttons for non-admins', () => {
      const el = render(false);
      expect(el.querySelector('[data-testid="edit-class-button"]')).toBeNull();
      expect(el.querySelector('[data-testid="delete-class-button"]')).toBeNull();
    });
  });

  it('saveStudent trims names, calls the service and updates the class', () => {
    const updated = makeClass();
    updated.students[0].firstName = 'Alicia';
    service.updateStudent.and.returnValue(of(updated));
    component.studentToEdit = component.currentClass.students[0];
    component.modalRef = modalRef as never;
    component.editFirstName = ' Alicia ';
    component.editLastName = 'Adams';

    component.saveStudent();

    expect(service.updateStudent).toHaveBeenCalledWith('c1', 'S1', 'Alicia', 'Adams');
    expect(modalRef.hide).toHaveBeenCalled();
    expect(component.currentClass.students[0].firstName).toBe('Alicia');
  });

  it('saveStudent rejects blank names without calling the service', () => {
    component.studentToEdit = component.currentClass.students[0];
    component.editFirstName = '  ';
    component.editLastName = 'Adams';
    component.saveStudent();
    expect(service.updateStudent).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
  });

  it('saveStudent keeps the modal open and shows an error on failure', () => {
    service.updateStudent.and.returnValue(throwError(() => new Error('fail')));
    component.studentToEdit = component.currentClass.students[0];
    component.modalRef = modalRef as never;
    component.editFirstName = 'A';
    component.editLastName = 'B';
    component.saveStudent();
    expect(modalRef.hide).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Unable');
  });

  it('removeStudent removes the student from the displayed class', () => {
    const updated = makeClass();
    updated.students = [updated.students[1]];
    service.removeStudent.and.returnValue(of(updated));
    component.studentToRemove = component.currentClass.students[0];
    component.modalRef = modalRef as never;

    component.removeStudent();

    expect(service.removeStudent).toHaveBeenCalledWith('c1', 'S1');
    expect(component.currentClass.students.length).toBe(1);
    expect(modalRef.hide).toHaveBeenCalled();
  });

  it('saveClass sends trimmed teacher name and numeric grade', () => {
    const updated = { ...makeClass(), teacherName: 'Andersen', grade: 3 };
    service.updateClass.and.returnValue(of(updated));
    component.modalRef = modalRef as never;
    component.editTeacherName = ' Andersen ';
    component.editGrade = '3' as unknown as number;

    component.saveClass();

    expect(service.updateClass).toHaveBeenCalledWith('c1', 'Andersen', 3);
    expect(component.currentClass.teacherName).toBe('Andersen');
  });

  it('deleteClass removes the class and clears the selection', fakeAsync(() => {
    service.deleteClass.and.returnValue(of('c1'));
    component.modalRef = modalRef as never;

    component.deleteClass();
    tick();

    expect(service.deleteClass).toHaveBeenCalledWith('c1');
    expect(component.classes.length).toBe(0);
    expect(component.selectedClassId).toBe('');
    expect(component.currentClass).toBeUndefined();
  }));

  it('deleteClass keeps the class on failure', () => {
    service.deleteClass.and.returnValue(throwError(() => new Error('fail')));
    component.modalRef = modalRef as never;
    component.deleteClass();
    expect(component.classes.length).toBe(1);
    expect(component.selectedClassId).toBe('c1');
    expect(component.errorMessage).toContain('Unable');
  });
});
