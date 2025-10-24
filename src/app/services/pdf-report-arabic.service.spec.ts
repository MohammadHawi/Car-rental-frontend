import { TestBed } from '@angular/core/testing';

import { PdfReportArabicService } from './pdf-report-arabic.service';

describe('PdfReportArabicService', () => {
  let service: PdfReportArabicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfReportArabicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
