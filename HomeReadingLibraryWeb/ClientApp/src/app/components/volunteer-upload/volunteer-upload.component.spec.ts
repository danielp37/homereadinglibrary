import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VolunteerUploadComponent } from './volunteer-upload.component';
import { BaggyBookService, UploadResult } from '../../services/baggy-book.service';
import { LoaderService } from '../../services/loader.service';
import { AuthService } from '../../modules/app-auth/services/auth.service';
import { OAuthService } from 'angular-oauth2-oidc';

describe('VolunteerUploadComponent', () => {
  let component: VolunteerUploadComponent;
  let fixture: ComponentFixture<VolunteerUploadComponent>;
  let httpMock: HttpTestingController;

  const uploadResult: UploadResult = {
    imported: ['Doe, Jane (jane@example.com) with 2 class assignment(s).'],
    skipped: ['Doe, Jane (jane@example.com) already exists.'],
    errors: ['Unrecognised day of week \'Funday\' for Doe, Jane / Mrs. Smith.'],
    importedCount: 1,
    skippedCount: 1,
    errorCount: 1
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VolunteerUploadComponent],
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
    fixture = TestBed.createComponent(VolunteerUploadComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:volunteer-template');
    spyOn(URL, 'revokeObjectURL');
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should upload the selected file to the volunteer upload endpoint', () => {
    const file = new File(['volunteer spreadsheet'], 'volunteers.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#volunteerUploadFile');

    Object.defineProperty(input, 'files', {
      value: [file]
    });

    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const uploadButton: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn.btn-primary');
    uploadButton.click();

    const request = httpMock.expectOne('/api/upload/volunteers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body instanceof FormData).toBeTrue();
    const uploadedFile = (request.request.body as FormData).get('file') as File;
    expect(uploadedFile).toEqual(jasmine.any(File));
    expect(uploadedFile.name).toBe(file.name);
    request.flush(uploadResult);

    expect(component.uploadResult).toEqual(uploadResult);
    expect(component.uploading).toBeFalse();
  });

  it('should download the volunteer template from the correct endpoint', () => {
    const appendedAnchor = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(appendedAnchor);
    spyOn(appendedAnchor, 'click');
    spyOn(document.body, 'appendChild').and.callFake(<T extends Node>(node: T) => node);
    spyOn(document.body, 'removeChild').and.callFake(<T extends Node>(node: T) => node);

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();

    const request = httpMock.expectOne('/api/upload/volunteers/template');
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['template'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));

    expect(appendedAnchor.download).toBe('volunteers-template.xlsx');
    expect(appendedAnchor.click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:volunteer-template');
  });

  it('should render returned upload counts and error details', () => {
    const domFixture = TestBed.createComponent(VolunteerUploadComponent);
    domFixture.componentInstance.uploadResult = uploadResult;
    domFixture.detectChanges();

    const element: HTMLElement = domFixture.nativeElement;
    expect(element.textContent).toContain('Imported: 1');
    expect(element.textContent).toContain('Skipped: 1');
    expect(element.textContent).toContain('Errors: 1');
    expect(element.textContent).toContain(uploadResult.errors[0]);
  });
});
