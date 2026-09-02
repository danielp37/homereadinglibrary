import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudentUploadComponent } from './student-upload.component';
import { BaggyBookService, UploadResult } from '../../services/baggy-book.service';
import { LoaderService } from '../../services/loader.service';
import { AuthService } from '../../modules/app-auth/services/auth.service';
import { OAuthService } from 'angular-oauth2-oidc';

describe('StudentUploadComponent', () => {
  let component: StudentUploadComponent;
  let fixture: ComponentFixture<StudentUploadComponent>;
  let httpMock: HttpTestingController;

  const uploadResult: UploadResult = {
    imported: ['Doe, John → Mrs. Smith (barcode: 2026123456789)'],
    skipped: ['Smith, Jane already in Mrs. Smith\'s class.'],
    errors: ['Class not found for teacher \'Unknown\' (student: Roe, Richard).'],
    importedCount: 1,
    skippedCount: 1,
    errorCount: 1
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StudentUploadComponent],
      imports: [HttpClientTestingModule],
      providers: [
        BaggyBookService,
        LoaderService,
        { provide: AuthService, useValue: {} },
        { provide: OAuthService, useValue: { getAccessToken: () => 'fake-token' } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentUploadComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:student-template');
    spyOn(URL, 'revokeObjectURL');
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should upload the selected file to the student upload endpoint', () => {
    const file = new File(['student spreadsheet'], 'students.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#studentUploadFile');

    Object.defineProperty(input, 'files', {
      value: [file]
    });

    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const uploadButton: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn.btn-primary');
    uploadButton.click();

    const request = httpMock.expectOne('/api/upload/students');
    expect(request.request.method).toBe('POST');
    expect(request.request.body instanceof FormData).toBeTrue();
    const uploadedFile = (request.request.body as FormData).get('file') as File;
    expect(uploadedFile).toEqual(jasmine.any(File));
    expect(uploadedFile.name).toBe(file.name);
    request.flush(uploadResult);

    expect(component.uploadResult).toEqual(uploadResult);
    expect(component.uploading).toBeFalse();
  });

  it('should download the student template from the correct endpoint', () => {
    const appendedAnchor = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(appendedAnchor);
    spyOn(appendedAnchor, 'click');
    spyOn(document.body, 'appendChild').and.callFake(<T extends Node>(node: T) => node);
    spyOn(document.body, 'removeChild').and.callFake(<T extends Node>(node: T) => node);

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();

    const request = httpMock.expectOne('/api/upload/students/template');
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['template'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));

    expect(appendedAnchor.download).toBe('students-template.xlsx');
    expect(appendedAnchor.click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:student-template');
  });

  it('should render returned upload counts and error details', () => {
    const domFixture = TestBed.createComponent(StudentUploadComponent);
    domFixture.componentInstance.uploadResult = uploadResult;
    domFixture.detectChanges();

    const element: HTMLElement = domFixture.nativeElement;
    expect(element.textContent).toContain('Imported: 1');
    expect(element.textContent).toContain('Skipped: 1');
    expect(element.textContent).toContain('Errors: 1');
    expect(element.textContent).toContain(uploadResult.errors[0]);
  });
});
