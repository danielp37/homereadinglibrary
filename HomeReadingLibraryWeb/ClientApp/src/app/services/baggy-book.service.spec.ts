import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { BaggyBookService } from './baggy-book.service';
import { AuthService } from '../modules/app-auth/services/auth.service';
import { LoaderService } from './loader.service';

describe('BaggyBookService class editing', () => {
  let service: BaggyBookService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BaggyBookService,
        { provide: AuthService, useValue: {} },
        { provide: OAuthService, useValue: { getAccessToken: () => 'token' } },
        { provide: LoaderService, useValue: { display: () => undefined } }
      ]
    });
    service = TestBed.inject(BaggyBookService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('updateStudent PUTs names and unwraps data', () => {
    const updated = { classId: 'c1', teacherName: 'T', grade: 1, students: [] };
    let result: unknown;
    service.updateStudent('c1', 'S1', 'Al', 'Ad').subscribe(r => result = r);

    const req = http.expectOne('/api/classes/c1/students/S1');
    expect(req.request.method).toBe('PUT');
    expect(JSON.parse(req.request.body)).toEqual({ firstName: 'Al', lastName: 'Ad' });
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({ data: updated });
    expect(result).toEqual(updated as never);
  });

  it('removeStudent DELETEs and unwraps data', () => {
    const updated = { classId: 'c1', teacherName: 'T', grade: 1, students: [] };
    let result: unknown;
    service.removeStudent('c1', 'S1').subscribe(r => result = r);

    const req = http.expectOne('/api/classes/c1/students/S1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: updated });
    expect(result).toEqual(updated as never);
  });

  it('updateClass PUTs teacher and grade', () => {
    let result: unknown;
    service.updateClass('c1', 'New', 3).subscribe(r => result = r);

    const req = http.expectOne('/api/classes/c1');
    expect(req.request.method).toBe('PUT');
    expect(JSON.parse(req.request.body)).toEqual({ teacherName: 'New', grade: 3 });
    req.flush({ data: { classId: 'c1', teacherName: 'New', grade: 3, students: [] } });
    expect((result as { teacherName: string }).teacherName).toBe('New');
  });

  it('deleteClass DELETEs and returns the deleted id', () => {
    let result: unknown;
    service.deleteClass('c1').subscribe(r => result = r);

    const req = http.expectOne('/api/classes/c1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: 'c1' });
    expect(result).toBe('c1');
  });
});
