import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnContractComponent } from './return-contract.component';

describe('ReturnContractComponent', () => {
  let component: ReturnContractComponent;
  let fixture: ComponentFixture<ReturnContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnContractComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
