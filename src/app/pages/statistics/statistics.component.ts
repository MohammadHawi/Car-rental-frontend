import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DataFetchService } from '../../services/data-fetch.service';

Chart.register(...registerables);

interface BusinessStats {
  totalCars: number;
  totalCustomers: number;
  activeContracts: number;
  overdueContracts: number;
  currentMonthRevenue: number;
  currentYearRevenue: number;
  fleetUtilizationRate: number;
  monthlyRevenueTrend: MonthlyRevenue[];
  topBrands: BrandPerformance[];
}

interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  netProfit: number;
  contractsCount: number;
}

interface BrandPerformance {
  brand: string;
  totalRentals: number;
  totalRentalDays: number;
  totalRevenue: number;
  carsCount: number;
}

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  isLoading = false;
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  businessStats: BusinessStats | null = null;
  brandDataSource = new MatTableDataSource<BrandPerformance>();
  revenueChart: Chart | null = null;

  constructor(
    private statisticsService: DataFetchService,
    private router: Router
  ) {
    // Generate available years (current year and 5 years back)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 6; i++) {
      this.availableYears.push(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.loadBusinessStatistics();
  }

  loadBusinessStatistics(): void {
    this.isLoading = true;
    this.statisticsService.getBusinessStatistics(this.selectedYear).subscribe({
      next: (data: BusinessStats) => {
        this.businessStats = data;
        this.brandDataSource.data = data.topBrands || [];
        this.createRevenueChart();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading business statistics:', error);
        this.isLoading = false;
      }
    });
  }

  createRevenueChart(): void {
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx || !this.businessStats) return;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const labels = this.businessStats.monthlyRevenueTrend.map(m => monthNames[m.month - 1]);
    const revenueData = this.businessStats.monthlyRevenueTrend.map(m => m.revenue);
    const expensesData = this.businessStats.monthlyRevenueTrend.map(m => m.expenses);
    const profitData = this.businessStats.monthlyRevenueTrend.map(m => m.netProfit);

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expenses',
            data: expensesData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Net Profit',
            data: profitData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
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
          },
          tooltip: {
            mode: 'index',
            intersect: false,
              callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                // Ensure we pass a number to Intl.NumberFormat because context.parsed.y can be null
                const raw = (context.parsed as any)?.y ?? context.parsed ?? 0;
                const value = typeof raw === 'number' ? raw : Number(raw);
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(value);
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact'
                }).format(value as number);
              }
            }
          }
        }
      }
    });
  }

  onYearChange(): void {
    this.loadBusinessStatistics();
  }

  refreshData(): void {
    this.loadBusinessStatistics();
  }

  navigateToCarStats(): void {
    this.router.navigate(['/statistics/cars']);
  }

  navigateToCustomerStats(): void {
    this.router.navigate(['/statistics/customers']);
  }

  navigateToBestCars(): void {
    this.router.navigate(['/statistics/cars']);
  }

  navigateToBrandAnalysis(): void {
    this.router.navigate(['/statistics/cars']);
  }
}