import { TestBed } from '@angular/core/testing';

import { FetchDocumentService } from './fetch.document.service';

describe('FetchDocumentService', () => {
  let service: FetchDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
