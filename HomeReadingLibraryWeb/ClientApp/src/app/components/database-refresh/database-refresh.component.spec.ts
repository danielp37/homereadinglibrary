import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DatabaseRefreshComponent } from './database-refresh.component';
import { BaggyBookService, DatabaseRefreshAuditRecord } from '../../services/baggy-book.service';
import { of, throwError } from 'rxjs';

describe('DatabaseRefreshComponent', () => {
  let component: DatabaseRefreshComponent;
  let fixture: ComponentFixture<DatabaseRefreshComponent>;
  let mockBaggyBookService: jasmine.SpyObj<BaggyBookService>;

  const successResponse = { message: 'Database refreshed successfully.', backupSuffix: 'backup_20240830120000' };
  const mockHistory: DatabaseRefreshAuditRecord[] = [
    { username: 'admin@school.org', refreshedAt: '2024-08-30T12:00:00Z', backupSuffix: 'backup_20240830120000' }
  ];

  beforeEach(waitForAsync(() => {
    mockBaggyBookService = jasmine.createSpyObj('BaggyBookService', ['refreshDatabase', 'getRefreshHistory']);
    mockBaggyBookService.refreshDatabase.and.returnValue(of(successResponse));
    mockBaggyBookService.getRefreshHistory.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [DatabaseRefreshComponent],
      imports: [FormsModule],
      providers: [{ provide: BaggyBookService, useValue: mockBaggyBookService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseRefreshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getRefreshHistory on init', () => {
    expect(mockBaggyBookService.getRefreshHistory).toHaveBeenCalled();
  });

  it('should set today in MM/dd/yyyy format', () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    expect(component.today).toBe(`${mm}/${dd}/${yyyy}`);
  });

  it('should initialize with empty confirmationText and no messages', () => {
    expect(component.confirmationText).toBe('');
    expect(component.successMessage).toBeNull();
    expect(component.errorMessage).toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('should initialize with empty refreshHistory', () => {
    expect(component.refreshHistory).toEqual([]);
    expect(component.historyLoading).toBeFalse();
  });

  it('confirmationMatches should be false when text is empty', () => {
    component.confirmationText = '';
    expect(component.confirmationMatches).toBeFalse();
  });

  it('confirmationMatches should be false when text does not match today', () => {
    component.confirmationText = '01/01/2000';
    expect(component.confirmationMatches).toBeFalse();
  });

  it('confirmationMatches should be true when text matches today', () => {
    component.confirmationText = component.today;
    expect(component.confirmationMatches).toBeTrue();
  });

  it('confirmationMatches should be true when text matches today with surrounding whitespace', () => {
    component.confirmationText = `  ${component.today}  `;
    expect(component.confirmationMatches).toBeTrue();
  });

  it('should not call service when confirmationMatches is false', () => {
    component.confirmationText = 'wrong';
    component.executeRefresh();
    expect(mockBaggyBookService.refreshDatabase).not.toHaveBeenCalled();
  });

  it('should call service with today when confirmationMatches is true', (done) => {
    component.confirmationText = component.today;
    component.executeRefresh();

    setTimeout(() => {
      expect(mockBaggyBookService.refreshDatabase).toHaveBeenCalledWith(component.today);
      done();
    }, 10);
  });

  it('should set successMessage and clear confirmationText on success', (done) => {
    component.confirmationText = component.today;
    component.executeRefresh();

    setTimeout(() => {
      expect(component.successMessage).toContain('refreshed successfully');
      expect(component.successMessage).toContain(successResponse.backupSuffix);
      expect(component.confirmationText).toBe('');
      expect(component.loading).toBeFalse();
      done();
    }, 10);
  });

  it('should reload history after a successful refresh', (done) => {
    mockBaggyBookService.getRefreshHistory.calls.reset();
    component.confirmationText = component.today;
    component.executeRefresh();

    setTimeout(() => {
      expect(mockBaggyBookService.getRefreshHistory).toHaveBeenCalled();
      done();
    }, 10);
  });

  it('should set errorMessage and leave confirmationText unchanged on error', (done) => {
    mockBaggyBookService.refreshDatabase.and.returnValue(
      throwError(() => new Error('Network failure'))
    );
    component.confirmationText = component.today;
    component.executeRefresh();

    setTimeout(() => {
      expect(component.errorMessage).toContain('Network failure');
      expect(component.successMessage).toBeNull();
      expect(component.loading).toBeFalse();
      done();
    }, 10);
  });

  it('should not call service again while loading', () => {
    component.confirmationText = component.today;
    component.loading = true;
    component.executeRefresh();
    expect(mockBaggyBookService.refreshDatabase).not.toHaveBeenCalled();
  });

  it('should populate refreshHistory when getRefreshHistory returns records', (done) => {
    mockBaggyBookService.getRefreshHistory.and.returnValue(of(mockHistory));
    const newFixture = TestBed.createComponent(DatabaseRefreshComponent);
    newFixture.detectChanges();

    setTimeout(() => {
      expect(newFixture.componentInstance.refreshHistory).toEqual(mockHistory);
      done();
    }, 10);
  });

  describe('DOM rendering', () => {
    it('should show the danger alert with destructive operation warning', () => {
      const domFixture = TestBed.createComponent(DatabaseRefreshComponent);
      domFixture.componentInstance.successMessage = null;
      domFixture.detectChanges();
      const el: HTMLElement = domFixture.nativeElement;
      const alert = el.querySelector('.alert-danger');
      expect(alert).toBeTruthy();
      expect(alert?.textContent).toContain('Destructive Operation');
    });

    it('should show success alert and hide form after successful refresh', () => {
      const domFixture = TestBed.createComponent(DatabaseRefreshComponent);
      const domComponent = domFixture.componentInstance;
      domComponent.successMessage = 'Database refreshed successfully. A backup was created (backup_20240830120000).';
      domFixture.detectChanges();
      const el: HTMLElement = domFixture.nativeElement;
      expect(el.querySelector('.alert-success')).toBeTruthy();
      expect(el.querySelector('.card.border-danger')).toBeFalsy();
    });

    it('should keep button disabled when confirmationText does not match today', () => {
      const domFixture = TestBed.createComponent(DatabaseRefreshComponent);
      const domComponent = domFixture.componentInstance;
      domComponent.confirmationText = 'wrong';
      domFixture.detectChanges();
      const btn: HTMLButtonElement = domFixture.nativeElement.querySelector('button.btn-danger');
      expect(btn?.disabled).toBeTrue();
    });

    it('should show "No previous refreshes" when history is empty', () => {
      const domFixture = TestBed.createComponent(DatabaseRefreshComponent);
      domFixture.componentInstance.refreshHistory = [];
      domFixture.detectChanges();
      const el: HTMLElement = domFixture.nativeElement;
      expect(el.textContent).toContain('No previous refreshes recorded');
    });

    it('should show history table when refreshHistory has records', () => {
      mockBaggyBookService.getRefreshHistory.and.returnValue(of(mockHistory));
      const domFixture = TestBed.createComponent(DatabaseRefreshComponent);
      domFixture.detectChanges();
      const el: HTMLElement = domFixture.nativeElement;
      expect(el.querySelector('table')).toBeTruthy();
      expect(el.textContent).toContain('admin@school.org');
      expect(el.textContent).toContain('backup_20240830120000');
    });
  });
});
