import { TestBed, inject } from '@angular/core/testing';

import { BookLookupService } from './book-lookup.service';

describe('BookLookupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookLookupService]
    });
  });

  it('should be created', inject([BookLookupService], (service: BookLookupService) => {
    expect(service).toBeTruthy();
  }));
});
