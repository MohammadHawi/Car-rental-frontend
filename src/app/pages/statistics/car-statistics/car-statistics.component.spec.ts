import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarStatisticsComponent } from './car-statistics.component';

describe('CarStatisticsComponent', () => {
  let component: CarStatisticsComponent;
  let fixture: ComponentFixture<CarStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
