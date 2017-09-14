/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GlobalEventsManager } from './global-events-manager.service';

describe('Service: GlobalEventsManager', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalEventsManager]
    });
  });

  it('should ...', inject([GlobalEventsManager], (service: GlobalEventsManager) => {
    expect(service).toBeTruthy();
  }));
});
