import { TestBed } from '@angular/core/testing';

import { DataSendService } from './data-send.service';

describe('DataSendService', () => {
  let service: DataSendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
