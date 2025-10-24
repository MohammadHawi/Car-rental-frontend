import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DataFetchService } from '../../../services/data-fetch.service';

Chart.register(...registerables);

interface CarStatistics {
  carId: number;
  carDetails: string;
  totalRentalDays: number;
  totalContracts: number;
  totalRevenue: number;
  utilizationRate: number;
  year: number;
}

interface BestPerformingCar {
  carId: number;
  carDetails: string;
  totalRentalDays: number;
  totalContracts: number;
  totalRevenue: number;
  utilizationRate: number;
  performanceRank: string;
}

interface MonthlyAverage {
  year: number;
  month: number;
  averageRentalDays: number;
  totalCarsRented: number;
  totalContracts: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-car-statistics',
  templateUrl: './car-statistics.component.html',
  standalone: false,
  styleUrls: ['./car-statistics.component.scss']
})
export class CarStatisticsComponent implements OnInit {
  isLoading = false;
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  bestCars: BestPerformingCar[] = [];
  carsDataSource = new MatTableDataSource<CarStatistics>();
  monthlyAverages: MonthlyAverage[] = [];
  monthlyChart: Chart | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private statisticsService: DataFetchService,
    private router: Router
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 6; i++) {
      this.availableYears.push(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.loadCarStatistics();
  }

  ngAfterViewInit() {
    this.carsDataSource.paginator = this.paginator;
    this.carsDataSource.sort = this.sort;
  }

  loadCarStatistics(): void {
    this.isLoading = true;

    Promise.all([
      this.loadBestPerformingCars(),
      this.loadAllCarsStatistics(),
      this.loadMonthlyAverages()
    ]).then(() => {
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading car statistics:', error);
      this.isLoading = false;
    });
  }

  loadBestPerformingCars(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.statisticsService.getBestPerformingCars(this.selectedYear, 10).subscribe({
        next: (data: BestPerformingCar[]) => {
          this.bestCars = data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading best performing cars:', error);
          reject(error);
        }
      });
    });
  }

  loadAllCarsStatistics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.statisticsService.getAllCarsYearlyReport(this.selectedYear).subscribe({
        next: (data: any[]) => {
          this.carsDataSource.data = data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading all cars statistics:', error);
          reject(error);
        }
      });
    });
  }

  loadMonthlyAverages(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.statisticsService.getMonthlyAverages(this.selectedYear).subscribe({
        next: (data: MonthlyAverage[]) => {
          this.monthlyAverages = data;
          this.createMonthlyChart();
          resolve();
        },
        error: (error) => {
          console.error('Error loading monthly averages:', error);
          reject(error);
        }
      });
    });
  }

  createMonthlyChart(): void {
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    const ctx = document.getElementById('monthlyAveragesChart') as HTMLCanvasElement;
    if (!ctx) return;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const labels = this.monthlyAverages.map(m => monthNames[m.month - 1]);
    const averageDays = this.monthlyAverages.map(m => m.averageRentalDays);
    const totalCarsRented = this.monthlyAverages.map(m => m.totalCarsRented);

    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Average Rental Days per Car',
            data: averageDays,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Total Cars Rented',
            data: totalCarsRented,
            type: 'line',
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Average Days'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cars Rented'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  onYearChange(): void {
    this.loadCarStatistics();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.carsDataSource.filter = filterValue.trim().toLowerCase();
  }

  goBack(): void {
    this.router.navigate(['/statistics']);
  }
}