import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewcontractComponent } from './newcontract.component';

describe('NewcontractComponent', () => {
  let component: NewcontractComponent;
  let fixture: ComponentFixture<NewcontractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewcontractComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewcontractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
