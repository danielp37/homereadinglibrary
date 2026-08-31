/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './authguard.service';
import { AuthService } from './auth.service';

describe('Service: Authguard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { loggedIn: jasmine.createSpy('loggedIn'), isAdmin: false } }
      ]
    });
  });

  it('should ...', inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));
});