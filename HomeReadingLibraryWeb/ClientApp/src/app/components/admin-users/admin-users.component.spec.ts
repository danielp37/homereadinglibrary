import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { BaggyBookService } from '../../services/baggy-book.service';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;
  let service: jasmine.SpyObj<BaggyBookService>;

  beforeEach(waitForAsync(() => {
    service = jasmine.createSpyObj('BaggyBookService', ['getAdmins', 'addAdmin', 'updateAdmin', 'deleteAdmin']);
    service.getAdmins.and.returnValue(of([{ id: 'a1', name: 'Existing Admin' }]));

    TestBed.configureTestingModule({
      declarations: [AdminUsersComponent],
      imports: [FormsModule],
      providers: [{ provide: BaggyBookService, useValue: service }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads admin users', () => {
    expect(component.admins).toEqual([{ id: 'a1', name: 'Existing Admin' }]);
  });

  it('adds an admin using trimmed name and password', () => {
    service.addAdmin.and.returnValue(of({ id: 'a2', name: 'New Admin' }));
    component.newName = ' New Admin ';
    component.newPassword = 'password';

    component.addAdmin();

    expect(service.addAdmin).toHaveBeenCalledWith('New Admin', 'password');
    expect(component.admins).toEqual([
      { id: 'a1', name: 'Existing Admin' },
      { id: 'a2', name: 'New Admin' }
    ]);
    expect(component.newName).toBe('');
    expect(component.newPassword).toBe('');
  });

  it('does not add an admin without a name and password', () => {
    component.newName = 'Admin';

    component.addAdmin();

    expect(service.addAdmin).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('required');
  });

  it('updates both the name and password of the selected admin', () => {
    service.updateAdmin.and.returnValue(of({ id: 'a1', name: 'Renamed Admin' }));
    component.editAdmin(component.admins[0]);
    component.editName = ' Renamed Admin ';
    component.editPassword = 'new-password';

    component.saveAdmin();

    expect(service.updateAdmin).toHaveBeenCalledWith('a1', 'Renamed Admin', 'new-password');
    expect(component.admins[0].name).toBe('Renamed Admin');
    expect(component.editingAdmin).toBeUndefined();
  });

  it('keeps the edit state and shows an error when updating fails', () => {
    service.updateAdmin.and.returnValue(throwError(() => new Error('failed')));
    component.editAdmin(component.admins[0]);
    component.editPassword = 'new-password';

    component.saveAdmin();

    expect(component.editingAdmin).toBeDefined();
    expect(component.errorMessage).toContain('Unable');
  });

  it('deletes an admin user', () => {
    service.deleteAdmin.and.returnValue(of('a1'));

    component.deleteAdmin(component.admins[0]);

    expect(service.deleteAdmin).toHaveBeenCalledWith('a1');
    expect(component.admins).toEqual([]);
  });
});
